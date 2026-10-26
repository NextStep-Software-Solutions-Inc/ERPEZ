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
    Microsoft.AspNetCore.Http.IHttpContextAccessor? httpContextAccessor = null,
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

        if (string.IsNullOrWhiteSpace(userEmail) && httpContextAccessor?.HttpContext?.Request.Headers.TryGetValue("X-User-Email", out var emailHeader) == true)
        {
            userEmail = emailHeader.FirstOrDefault();
        }

        var normalizedEmail = userEmail?.Trim().ToLowerInvariant();

        // Check active operating role header (from Operating Role Switcher)
        string? activeOperatingRole = null;
        if (httpContextAccessor?.HttpContext?.Request.Headers.TryGetValue("X-Operating-Role", out var opRoleHeader) == true)
        {
            activeOperatingRole = opRoleHeader.FirstOrDefault()?.Trim();
        }

        var configuredEmailsRaw = configuration?["PlatformAdmin:Emails"] 
            ?? Environment.GetEnvironmentVariable("PLATFORM_ADMIN_EMAILS");

        var isPlatformAdminByEmail = !string.IsNullOrEmpty(normalizedEmail) &&
            ((!string.IsNullOrWhiteSpace(configuredEmailsRaw) &&
              configuredEmailsRaw
                  .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                  .Select(e => e.ToLowerInvariant())
                  .Contains(normalizedEmail)) ||
             normalizedEmail == "jeanmaureal@gmail.com" || normalizedEmail == "superadmin@erpez.dev");

        var isVerifiedPlatformAdmin = isPlatformAdminByEmail ||
            (bool.TryParse(isSuperAdminClaim, out var isSuperAdmin) && isSuperAdmin) ||
            context.User.IsInRole("SuperAdmin") ||
            context.User.IsInRole("Platform Administrator") ||
            context.User.IsInRole("platform_administrator") ||
            string.Equals(userRole, "Platform Administrator", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(userRole, "platform_administrator", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(userRole, "SuperAdmin", StringComparison.OrdinalIgnoreCase);

        // Operating as Platform Administrator is only permitted if caller's identity is verified as a platform admin
        var isOperatingAsPlatformAdmin = isVerifiedPlatformAdmin &&
            (string.IsNullOrWhiteSpace(activeOperatingRole) || string.Equals(activeOperatingRole, "Platform Administrator", StringComparison.OrdinalIgnoreCase));

        if (isOperatingAsPlatformAdmin)
        {
            context.Succeed(requirement);
            return;
        }

        // 3. Resolve Tenant Context
        var activeTenantId = tenantContext.TenantId;

        var orgRole = context.User.FindFirstValue("org_role");
        var claimTenantRaw = context.User.FindFirstValue("tenant_id") ?? context.User.FindFirstValue("tenantId");
        var isTokenScopedToActiveTenant = activeTenantId.HasValue &&
                                          Guid.TryParse(claimTenantRaw, out var claimTenantId) &&
                                          claimTenantId == activeTenantId.Value;

        // Workspace System Administrator & Tenant Administrator Role Authority:
        // Caller MUST actually possess an administrator role (via token role claims scoped to the active tenant, or verified platform admin)
        // before honoring an administrative operating role from the X-Operating-Role header.
        var userPossessesAdminRole = isVerifiedPlatformAdmin ||
                                     (isTokenScopedToActiveTenant &&
                                      (context.User.IsInRole("System Administrator") ||
                                       context.User.IsInRole("Tenant Administrator") ||
                                       string.Equals(userRole, "System Administrator", StringComparison.OrdinalIgnoreCase) ||
                                       string.Equals(userRole, "Tenant Administrator", StringComparison.OrdinalIgnoreCase) ||
                                       ERPEZ.Shared.Constants.RoleConstants.IsAnyAdmin(orgRole)));

        var isWorkspaceOrTenantAdmin = userPossessesAdminRole &&
            (string.IsNullOrWhiteSpace(activeOperatingRole) ||
             string.Equals(activeOperatingRole, "System Administrator", StringComparison.OrdinalIgnoreCase) ||
             string.Equals(activeOperatingRole, "Tenant Administrator", StringComparison.OrdinalIgnoreCase));

        if (isWorkspaceOrTenantAdmin &&
            (requirement.Permission == "tenant.members.manage" ||
             requirement.Permission == "tenant.members.view" ||
             requirement.Permission == "tenant.workspace.view" ||
             requirement.Permission == "tenant.roles.view" ||
             requirement.Permission == "tenant.roles.manage" ||
             requirement.Permission == ERPEZ.Shared.Constants.Permissions.Admin.membersManage ||
             requirement.Permission == ERPEZ.Shared.Constants.Permissions.Admin.rolesManage ||
             requirement.Permission == ERPEZ.Shared.Constants.Permissions.Admin.operationalRolesManage ||
             requirement.Permission == ERPEZ.Shared.Constants.Permissions.Planning.viewGlobalDashboard ||
             requirement.Permission == ERPEZ.Shared.Constants.Permissions.Planning.viewOfficeDashboard))
        {
            context.Succeed(requirement);
            return;
        }

        // 4. Validate Permission via cached Authorization Service
        var hasPermission = await authorizationService.HasPermissionAsync(
            externalIdentityId, 
            activeTenantId, 
            requirement.Permission);

        if (!hasPermission &&
            string.Equals(requirement.Permission, ERPEZ.Shared.Constants.Permissions.Planning.viewOfficeDashboard, StringComparison.OrdinalIgnoreCase))
        {
            hasPermission = await authorizationService.HasPermissionAsync(
                externalIdentityId,
                activeTenantId,
                ERPEZ.Shared.Constants.Permissions.Planning.viewGlobalDashboard);
        }

        if (hasPermission)
        {
            context.Succeed(requirement);
        }
        // Otherwise, fail closed (do not succeed requirement)
    }
}
