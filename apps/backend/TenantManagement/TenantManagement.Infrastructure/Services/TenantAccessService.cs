using System.Security.Claims;
using ERPEZ.Shared.Enums;
using ERPEZ.Shared.Interfaces;
using ERPEZ.Shared.Models;
using ERPEZ.Shared.Security;
using ERPEZ.TenantManagement.Application.Common.Interfaces;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.TenantManagement.Infrastructure.Services;

/// <summary>
/// Authoritative gatekeeper evaluating tenant governance, domain constraints,
/// license validity, and caller membership before operational database credentials can be accessed.
/// Never materializes or exposes DbConnectionString.
/// </summary>
public class TenantAccessService(
    ApplicationDbContext dbContext,
    ILicenseService licenseService) : ITenantAccessService
{
    public async Task<TenantAccessResult> EvaluateAccessAsync(
        ClaimsPrincipal user,
        Guid candidateTenantId,
        string requestHost,
        CancellationToken cancellationToken = default)
    {
        // 1. Authentication Prerequisite
        if (user?.Identity?.IsAuthenticated != true)
        {
            return TenantAccessResult.Fail(
                "Authentication credentials missing or invalid.",
                "AUTH_REQUIRED",
                401);
        }

        var externalIdentityId = user.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? user.FindFirstValue("sub");

        if (string.IsNullOrWhiteSpace(externalIdentityId))
        {
            return TenantAccessResult.Fail(
                "Authenticated identity identifier (sub) is missing.",
                "AUTH_REQUIRED",
                401);
        }

        // 2. Server-side Membership Authorization (sub -> TenantMember -> TenantId)
        var isMember = await dbContext.TenantMembers!
            .AsNoTracking()
            .AnyAsync(tm => tm.TenantId == candidateTenantId &&
                            (tm.ExternalIdentityId == externalIdentityId || tm.UserId == externalIdentityId) &&
                            tm.Status == Status.Active &&
                            !tm.IsDeleted, cancellationToken);

        if (!isMember)
        {
            return TenantAccessResult.Fail(
                "Caller is not an active authorized member of this tenant.",
                "TENANT_MEMBERSHIP_REQUIRED",
                403);
        }

        // 3. Tenant Existence & Governance (Notice: DbConnectionString is NEVER materialized here)
        var tenantInfo = await dbContext.Tenants!
            .AsNoTracking()
            .Where(t => t.Id == candidateTenantId && !t.IsDeleted)
            .Select(t => new
            {
                t.Id,
                t.Name,
                t.IsDisabled,
                t.ProvisioningState,
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

        // 4. Tenant Disabled Check
        if (tenantInfo.IsDisabled)
        {
            return TenantAccessResult.Fail(
                "Tenant access has been disabled by administrator.",
                "TENANT_DISABLED",
                403);
        }

        // 5. Tenant Provisioning Readiness Check
        if (tenantInfo.ProvisioningState != TenantProvisioningState.Ready)
        {
            return TenantAccessResult.Fail(
                "Tenant operational database is currently being provisioned.",
                "TENANT_PROVISIONING",
                503);
        }

        // 6. Host Domain Constraint Check (using DNS label-boundary matcher)
        if (!HostMatcher.IsHostAllowed(requestHost, tenantInfo.AllowedDomain))
        {
            return TenantAccessResult.Fail(
                $"Domain constraint violation: Host '{requestHost}' is not authorized for this tenant.",
                "DOMAIN_VIOLATION",
                403);
        }

        // 7. License & Expiration Check
        var license = await dbContext.LicenseKeys!
            .AsNoTracking()
            .Where(lk => lk.TenantId == candidateTenantId && !lk.IsDeleted)
            .OrderByDescending(lk => lk.ExpiresAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (license != null)
        {
            var validation = licenseService.ValidateLicense(license, requestHost);
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
            license?.Status.ToString() ?? "Active"
        );

        return TenantAccessResult.Success(accessContext);
    }
}
