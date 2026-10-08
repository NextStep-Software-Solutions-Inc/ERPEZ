using System.Security.Claims;
using ERPEZ.Shared.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace ERPEZ.Shared.Authorization;

/// <summary>
/// Authorization handler that validates functional permissions via IUserAuthorizationService.
/// Enforces the global fail-closed security invariant.
/// </summary>
public class PermissionAuthorizationHandler(
    IUserAuthorizationService authorizationService,
    ITenantContextService tenantContext,
    Microsoft.Extensions.Configuration.IConfiguration? configuration = null) : AuthorizationHandler<PermissionRequirement>
{
    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        // 1. Resolve External Identity (Keycloak sub claim)
        var externalIdentityId = context.User.FindFirstValue(ClaimTypes.NameIdentifier) 
            ?? context.User.FindFirstValue("sub");

        if (string.IsNullOrWhiteSpace(externalIdentityId))
        {
            // Fail closed: No authenticated subject found
            return;
        }

        // 2. SuperAdmin / Platform Administrator verified identity check
        var isSuperAdminClaim = context.User.FindFirstValue("is_super_admin") 
            ?? context.User.FindFirstValue("super_admin")
            ?? context.User.FindFirstValue("is_platform_admin");

        var userRole = context.User.FindFirstValue(ClaimTypes.Role) ?? context.User.FindFirstValue("role");
        var userEmail = context.User.FindFirstValue(ClaimTypes.Email)
            ?? context.User.FindFirstValue("email")
            ?? context.User.FindFirstValue("primary_email_address");

        var normalizedEmail = userEmail?.Trim().ToLowerInvariant();

        var configuredEmailsRaw = configuration?["PlatformAdmin:Emails"] 
            ?? Environment.GetEnvironmentVariable("PLATFORM_ADMIN_EMAILS");

        var isPlatformAdminByEmail = !string.IsNullOrEmpty(normalizedEmail) &&
            !string.IsNullOrWhiteSpace(configuredEmailsRaw) &&
            configuredEmailsRaw
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Select(e => e.ToLowerInvariant())
                .Contains(normalizedEmail);

        var isVerifiedPlatformAdmin = isPlatformAdminByEmail ||
            (bool.TryParse(isSuperAdminClaim, out var isSuperAdmin) && isSuperAdmin) ||
            context.User.IsInRole("SuperAdmin") ||
            context.User.IsInRole("Platform Administrator") ||
            context.User.IsInRole("platform_administrator") ||
            string.Equals(userRole, "Platform Administrator", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(userRole, "platform_administrator", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(userRole, "SuperAdmin", StringComparison.OrdinalIgnoreCase);

        if (isVerifiedPlatformAdmin)
        {
            context.Succeed(requirement);
            return;
        }

        // 3. Resolve Tenant Context
        var activeTenantId = tenantContext.TenantId;

        // Workspace System Administrator & Tenant Administrator Role Authority from verified token claims
        var isWorkspaceOrTenantAdmin = string.Equals(userRole, "System Administrator", StringComparison.OrdinalIgnoreCase) ||
                                      string.Equals(userRole, "Tenant Administrator", StringComparison.OrdinalIgnoreCase);

        if (isWorkspaceOrTenantAdmin &&
            (requirement.Permission == "tenant.members.manage" ||
             requirement.Permission == "tenant.members.view" ||
             requirement.Permission == "tenant.workspace.view" ||
             requirement.Permission == "tenant.roles.view" ||
             requirement.Permission == "tenant.roles.manage" ||
             requirement.Permission == ERPEZ.Shared.Constants.Permissions.Admin.membersManage ||
             requirement.Permission == ERPEZ.Shared.Constants.Permissions.Admin.rolesManage ||
             requirement.Permission == ERPEZ.Shared.Constants.Permissions.Admin.operationalRolesManage))
        {
            context.Succeed(requirement);
            return;
        }

        // 4. Validate Permission via cached Authorization Service
        var hasPermission = await authorizationService.HasPermissionAsync(
            externalIdentityId, 
            activeTenantId, 
            requirement.Permission);

        if (hasPermission)
        {
            context.Succeed(requirement);
        }
        // Otherwise, fail closed (do not succeed requirement)
    }
}
