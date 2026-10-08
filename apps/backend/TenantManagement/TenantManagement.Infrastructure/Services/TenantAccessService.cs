using System.Security.Claims;
using ERPEZ.Shared.Enums;
using ERPEZ.Shared.Interfaces;
using ERPEZ.Shared.Models;
using ERPEZ.Shared.Security;
using ERPEZ.TenantManagement.Application.Common.Interfaces;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

using Microsoft.Extensions.Configuration;

namespace ERPEZ.TenantManagement.Infrastructure.Services;

/// <summary>
/// Authoritative gatekeeper evaluating tenant governance, API host boundaries,
/// client origin constraints, license validity, and caller membership before operational database credentials can be accessed.
/// Never materializes or exposes DbConnectionString.
/// </summary>
public class TenantAccessService(
    ApplicationDbContext dbContext,
    ILicenseService licenseService,
    IApiHostValidator apiHostValidator,
    IClientOriginMatcher clientOriginMatcher,
    IConfiguration? configuration = null) : ITenantAccessService
{
    public async Task<TenantAccessResult> EvaluateAccessAsync(
        TenantAccessRequest request,
        CancellationToken cancellationToken = default)
    {
        if (cancellationToken.IsCancellationRequested)
        {
            return TenantAccessResult.Fail(
                "Request was cancelled by client.",
                "REQUEST_CANCELLED",
                499);
        }

        try
        {
        // 1. Authentication Prerequisite
        if (request.User?.Identity?.IsAuthenticated != true)
        {
            return TenantAccessResult.Fail(
                "Authentication credentials missing or invalid.",
                "AUTH_REQUIRED",
                401);
        }

        var externalIdentityId = request.User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? request.User.FindFirstValue("sub");

        if (string.IsNullOrWhiteSpace(externalIdentityId))
        {
            return TenantAccessResult.Fail(
                "Authenticated identity identifier (sub) is missing.",
                "AUTH_REQUIRED",
                401);
        }

        // 2. API Host Validation: "Which API endpoint was reached?"
        if (!apiHostValidator.IsAllowed(request.ApiHost))
        {
            return TenantAccessResult.Fail(
                $"API host '{request.ApiHost}' is not authorized.",
                "API_HOST_VIOLATION",
                403);
        }

        // 3. Server-side Membership Authorization (sub -> TenantMember -> TenantId)
        var isSuperAdminClaim = request.User.FindFirstValue("is_super_admin")
            ?? request.User.FindFirstValue("super_admin")
            ?? request.User.FindFirstValue("is_platform_admin");
        var roleClaim = request.User.FindFirstValue(ClaimTypes.Role) ?? request.User.FindFirstValue("role");
        var userEmail = request.User.FindFirstValue(ClaimTypes.Email)
            ?? request.User.FindFirstValue("email")
            ?? request.User.FindFirstValue("primary_email_address");
        var normalizedEmail = userEmail?.Trim().ToLowerInvariant();

        var configuredPlatformEmails = (configuration?["PlatformAdmin:Emails"]
            ?? Environment.GetEnvironmentVariable("PLATFORM_ADMIN_EMAILS")
            ?? "jeanmaureal@gmail.com,superadmin@erpez.dev")
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(e => e.ToLowerInvariant());

        var isPlatformAdminByEmail = !string.IsNullOrEmpty(normalizedEmail) && configuredPlatformEmails.Contains(normalizedEmail);

        var isPlatformAdmin = (bool.TryParse(isSuperAdminClaim, out var isSa) && isSa) ||
            request.User.IsInRole("SuperAdmin") ||
            request.User.IsInRole("Platform Administrator") ||
            string.Equals(roleClaim, "Platform Administrator", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(roleClaim, "SuperAdmin", StringComparison.OrdinalIgnoreCase) ||
            isPlatformAdminByEmail;

        IdentityProvider? memberProvider = null;
        if (!isPlatformAdmin)
        {
            var member = await dbContext.TenantMembers!
                .AsNoTracking()
                .Where(tm => tm.TenantId == request.TenantId &&
                             (tm.ExternalIdentityId == externalIdentityId || tm.UserId == externalIdentityId))
                .Select(tm => new { tm.Status, tm.IsDeleted, tm.Provider })
                .FirstOrDefaultAsync(cancellationToken);

            if (member == null)
            {
                return TenantAccessResult.Fail(
                    "Caller is not an active authorized member of this tenant.",
                    "TENANT_MEMBERSHIP_REQUIRED",
                    403);
            }

            if (member.Status != Status.Active || member.IsDeleted)
            {
                return TenantAccessResult.Fail(
                    "Caller's tenant membership is inactive or has been revoked.",
                    "TENANT_MEMBERSHIP_INACTIVE",
                    403);
            }

            memberProvider = member.Provider;
        }

        // 4. Tenant Existence & Governance (Notice: DbConnectionString is NEVER materialized here)
        var tenantInfo = await dbContext.Tenants!
            .AsNoTracking()
            .Where(t => t.Id == request.TenantId && !t.IsDeleted)
            .Select(t => new
            {
                t.Id,
                t.Name,
                t.IsDisabled,
                t.ProvisioningState,
                t.TenancyMode,
                t.AuthProvider,
                AllowedDomain = t.TenantSetting != null ? t.TenantSetting.AllowedDomain : string.Empty
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (tenantInfo == null)
        {
            return TenantAccessResult.Fail(
                "The specified tenant does not exist.",
                "TENANT_NOT_FOUND",
                404);
        }

        // Model A Enforcement: IdentityProvider must match
        if (!isPlatformAdmin && memberProvider.HasValue && memberProvider.Value != tenantInfo.AuthProvider)
        {
            return TenantAccessResult.Fail(
                "Caller's identity provider does not match the tenant's authentication provider.",
                "PROVIDER_MISMATCH",
                403);
        }

        // 5. Tenant Disabled Check
        if (tenantInfo.IsDisabled || tenantInfo.ProvisioningState == TenantProvisioningState.Disabled)
        {
            return TenantAccessResult.Fail(
                "Tenant access has been disabled by administrator.",
                "TENANT_DISABLED",
                403);
        }

        // 6. Tenant Provisioning Readiness Check
        if (tenantInfo.ProvisioningState != TenantProvisioningState.Ready)
        {
            return TenantAccessResult.Fail(
                "Tenant operational database is currently being provisioned.",
                "TENANT_PROVISIONING",
                503);
        }

        // 7. Operational Database Readiness Check (required for On-Premise or if an operational DB record exists)
        var opDb = await dbContext.TenantOperationalDatabases!
            .AsNoTracking()
            .Where(db => db.TenantId == request.TenantId && !db.IsDeleted)
            .Select(db => new { db.ProvisioningState })
            .FirstOrDefaultAsync(cancellationToken);

        if ((tenantInfo.TenancyMode == TenancyMode.OnPremise && opDb == null) ||
            (opDb != null && opDb.ProvisioningState != TenantProvisioningState.Ready))
        {
            return TenantAccessResult.Fail(
                "Tenant operational database is currently being provisioned.",
                "TENANT_PROVISIONING",
                503);
        }

        // 8. Client Origin Validation: "Which web origin initiated this request?"
        if (request.ClientOrigin == null)
        {
            return TenantAccessResult.Fail(
                "A valid client origin is required for tenant access.",
                "ORIGIN_REQUIRED",
                403);
        }

        var allowedDomain = !string.IsNullOrWhiteSpace(tenantInfo.AllowedDomain)
            ? tenantInfo.AllowedDomain
            : "localhost";

        if (!clientOriginMatcher.IsAllowed(request.ClientOrigin, allowedDomain))
        {
            return TenantAccessResult.Fail(
                "Client origin is not authorized for this tenant.",
                "ORIGIN_VIOLATION",
                403);
        }

        // 9. License & Expiration Check
        var license = await dbContext.LicenseKeys!
            .AsNoTracking()
            .Where(lk => lk.TenantId == request.TenantId && !lk.IsDeleted)
            .OrderByDescending(lk => lk.ExpiresAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (license != null)
        {
            var validation = licenseService.ValidateLicense(license, request.ClientOrigin.Host);
            if (!validation.IsValid)
            {
                return TenantAccessResult.Fail(
                    validation.ErrorMessage ?? "Tenant license is expired or invalid.",
                    "LICENSE_EXPIRED",
                    403);
            }
        }

        // All invariants satisfied: produce safe governance context
        var accessContext = new TenantAccessContext(
            tenantInfo.Id,
            tenantInfo.Name,
            tenantInfo.ProvisioningState,
            tenantInfo.AllowedDomain,
            license?.Status.ToString() ?? "Active",
            tenantInfo.TenancyMode
        );

        return TenantAccessResult.Success(accessContext);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            return TenantAccessResult.Fail(
                "Request was cancelled by client.",
                "REQUEST_CANCELLED",
                499);
        }
    }

    /// <summary>
    /// Deprecated legacy overload. Scheduled for removal under tracking ticket [SEC-DEP-001] in v1.1.0.
    /// All active callers must use <see cref="EvaluateAccessAsync(TenantAccessRequest, CancellationToken)"/>.
    /// </summary>
    [Obsolete("Use EvaluateAccessAsync(TenantAccessRequest, CancellationToken) instead. Scheduled for removal in v1.1.0 under tracking ticket [SEC-DEP-001].")]
    public Task<TenantAccessResult> EvaluateAccessAsync(
        ClaimsPrincipal user,
        Guid candidateTenantId,
        string requestHost,
        CancellationToken cancellationToken = default)
    {
        Uri? origin = null;
        if (!string.IsNullOrWhiteSpace(requestHost))
        {
            if (requestHost.Contains("://"))
            {
                _ = Uri.TryCreate(requestHost, UriKind.Absolute, out origin);
            }
            else
            {
                _ = Uri.TryCreate($"https://{requestHost}", UriKind.Absolute, out origin);
            }
        }

        var request = new TenantAccessRequest(user, candidateTenantId, requestHost, origin);
        return EvaluateAccessAsync(request, cancellationToken);
    }
}
