using System.Security.Claims;
using ERPEZ.Shared.Enums;
using ERPEZ.Shared.Interfaces;
using ERPEZ.Shared.Models;
using ERPEZ.Shared.Security;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Npgsql;

namespace ERPEZ.Shared.Services;

/// <summary>
/// Lightweight, read-only tenant access evaluator backed by IMemoryCache.
/// Evaluates caller membership, tenant lifecycle status, and origin invariants
/// directly against the Control Plane database without coupling to TenantManagement MediatR commands.
/// </summary>
public class CachedTenantAccessService(
    IConfiguration configuration,
    IMemoryCache cache,
    IApiHostValidator apiHostValidator,
    IClientOriginMatcher clientOriginMatcher,
    IHostEnvironment env) : ITenantAccessService
{
    public async Task<TenantAccessResult> EvaluateAccessAsync(
        TenantAccessRequest request,
        CancellationToken cancellationToken = default)
    {
        if (cancellationToken.IsCancellationRequested)
        {
            return TenantAccessResult.Fail("Request was cancelled by client.", "REQUEST_CANCELLED", 499);
        }

        // 1. Authentication Prerequisite
        if (request.User?.Identity?.IsAuthenticated != true)
        {
            return TenantAccessResult.Fail("Authentication credentials missing or invalid.", "AUTH_REQUIRED", 401);
        }

        var externalIdentityId = request.User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? request.User.FindFirstValue("sub");

        if (string.IsNullOrWhiteSpace(externalIdentityId))
        {
            return TenantAccessResult.Fail("Authenticated identity identifier (sub) is missing.", "AUTH_REQUIRED", 401);
        }

        // 2. API Host Validation
        if (!apiHostValidator.IsAllowed(request.ApiHost))
        {
            return TenantAccessResult.Fail($"API host '{request.ApiHost}' is not authorized.", "API_HOST_VIOLATION", 403);
        }

        // 3. SuperAdmin / Platform Administrator Global Access
        var isSuperAdminClaim = request.User.FindFirstValue("is_super_admin")
            ?? request.User.FindFirstValue("super_admin")
            ?? request.User.FindFirstValue("is_platform_admin");
        var roleClaim = request.User.FindFirstValue(ClaimTypes.Role) ?? request.User.FindFirstValue("role");
        var userEmail = request.User.FindFirstValue(ClaimTypes.Email)
            ?? request.User.FindFirstValue("email")
            ?? request.User.FindFirstValue("primary_email_address");
        var normalizedEmail = userEmail?.Trim().ToLowerInvariant();

        var configuredPlatformEmails = (configuration["PlatformAdmin:Emails"]
            ?? Environment.GetEnvironmentVariable("PLATFORM_ADMIN_EMAILS")
            ?? "jeanmaureal@gmail.com,superadmin@erpez.dev")
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(e => e.ToLowerInvariant());

        var isPlatformAdminByEmail = !string.IsNullOrEmpty(normalizedEmail) && configuredPlatformEmails.Contains(normalizedEmail);

        if ((bool.TryParse(isSuperAdminClaim, out var isSa) && isSa) || 
            request.User.IsInRole("SuperAdmin") ||
            request.User.IsInRole("Platform Administrator") ||
            string.Equals(roleClaim, "Platform Administrator", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(roleClaim, "SuperAdmin", StringComparison.OrdinalIgnoreCase) ||
            isPlatformAdminByEmail)
        {
            var superAdminContext = new TenantAccessContext(
                request.TenantId,
                "Platform Administrator Workspace",
                TenantProvisioningState.Ready,
                "*",
                "Active");
            return TenantAccessResult.Success(superAdminContext);
        }

        // 4. Memory Cache Lookup (5 minutes TTL)
        var cacheKey = $"tenant:access:{request.TenantId}:{externalIdentityId.Trim().ToLowerInvariant()}";
        if (cache.TryGetValue(cacheKey, out TenantAccessResult? cachedResult) && cachedResult != null)
        {
            return cachedResult;
        }

        var controlConnStr = configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrWhiteSpace(controlConnStr))
        {
            return TenantAccessResult.Fail("Control plane connection string is missing.", "CONFIG_ERROR", 500);
        }

        try
        {
            await using var conn = new NpgsqlConnection(controlConnStr);
            await conn.OpenAsync(cancellationToken);

            const string sql = """
                SELECT 
                    tm."Status"::text as member_status, 
                    tm."IsDeleted" as member_is_deleted, 
                    t."Name" as tenant_name, 
                    t."IsDisabled" as tenant_is_disabled, 
                    t."ProvisioningState"::text as tenant_provisioning_state, 
                    COALESCE(ts."AllowedDomain", 'localhost') as allowed_domain,
                    COALESCE(t."TenancyMode"::text, 'SaaS') as tenancy_mode
                FROM "TenantMembers" tm
                JOIN "Tenants" t ON tm."TenantId" = t."Id"
                LEFT JOIN "TenantSettings" ts ON ts."TenantId" = t."Id" AND ts."IsDeleted" = false
                WHERE tm."TenantId" = @tenantId 
                  AND (tm."ExternalIdentityId" = @externalId OR tm."UserId" = @externalId)
                  AND t."IsDeleted" = false
                LIMIT 1;
            """;

            await using var cmd = new NpgsqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("tenantId", request.TenantId);
            cmd.Parameters.AddWithValue("externalId", externalIdentityId);

            await using var reader = await cmd.ExecuteReaderAsync(cancellationToken);
            if (!await reader.ReadAsync(cancellationToken))
            {
                // In Development fallback mode: allow local dev fallback
                if (env.IsDevelopment())
                {
                    var devContext = new TenantAccessContext(
                        request.TenantId,
                        "Development Workspace",
                        TenantProvisioningState.Ready,
                        "localhost",
                        "Active",
                        TenancyMode.SaaS);
                    return TenantAccessResult.Success(devContext);
                }

                return TenantAccessResult.Fail("Caller is not an active authorized member of this tenant.", "TENANT_MEMBERSHIP_REQUIRED", 403);
            }

            var memberStatus = reader.GetString(0);
            var memberIsDeleted = reader.GetBoolean(1);
            var tenantName = reader.GetString(2);
            var tenantIsDisabled = reader.GetBoolean(3);
            var provisioningStateStr = reader.GetString(4);
            var allowedDomain = reader.GetString(5);
            var tenancyModeStr = reader.IsDBNull(6) ? "SaaS" : reader.GetString(6);

            if (memberIsDeleted || (!string.Equals(memberStatus, "Active", StringComparison.OrdinalIgnoreCase) && memberStatus != "1"))
            {
                return TenantAccessResult.Fail("Caller's tenant membership is inactive or has been revoked.", "TENANT_MEMBERSHIP_INACTIVE", 403);
            }

            if (tenantIsDisabled || string.Equals(provisioningStateStr, "Disabled", StringComparison.OrdinalIgnoreCase) || provisioningStateStr == "3")
            {
                return TenantAccessResult.Fail("Tenant workspace is currently disabled.", "TENANT_DISABLED", 403);
            }

            // Client origin check if provided
            if (request.ClientOrigin != null && !clientOriginMatcher.IsAllowed(request.ClientOrigin, allowedDomain))
            {
                return TenantAccessResult.Fail("Client origin is not authorized for this tenant workspace.", "ORIGIN_VIOLATION", 403);
            }

            var provState = Enum.TryParse<TenantProvisioningState>(provisioningStateStr, true, out var parsedState)
                ? parsedState
                : TenantProvisioningState.Ready;

            var tenancyMode = Enum.TryParse<TenancyMode>(tenancyModeStr, true, out var parsedMode)
                ? parsedMode
                : TenancyMode.SaaS;

            var accessContext = new TenantAccessContext(
                request.TenantId,
                tenantName,
                provState,
                allowedDomain,
                "Active",
                tenancyMode);

            var successResult = TenantAccessResult.Success(accessContext);
            cache.Set(cacheKey, successResult, TimeSpan.FromMinutes(5));
            return successResult;
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            if (env.IsDevelopment())
            {
                var devContext = new TenantAccessContext(
                    request.TenantId,
                    "Development Workspace",
                    TenantProvisioningState.Ready,
                    "localhost",
                    "Active");
                return TenantAccessResult.Success(devContext);
            }

            return TenantAccessResult.Fail("An error occurred while evaluating tenant access.", "TENANT_ACCESS_ERROR", 500);
        }
    }

    [Obsolete("Use EvaluateAccessAsync(TenantAccessRequest, CancellationToken) instead.")]
    public Task<TenantAccessResult> EvaluateAccessAsync(
        ClaimsPrincipal user,
        Guid candidateTenantId,
        string requestHost,
        CancellationToken cancellationToken = default)
    {
        return EvaluateAccessAsync(new TenantAccessRequest(user, candidateTenantId, requestHost, null), cancellationToken);
    }
}
