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
    ITenantContextService tenantContext) : AuthorizationHandler<PermissionRequirement>
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

        // 2. SuperAdmin global bypass check
        var isSuperAdminClaim = context.User.FindFirstValue("is_super_admin") 
            ?? context.User.FindFirstValue("super_admin");

        if ((bool.TryParse(isSuperAdminClaim, out var isSuperAdmin) && isSuperAdmin) ||
            context.User.IsInRole("SuperAdmin"))
        {
            context.Succeed(requirement);
            return;
        }

        // 3. Resolve Tenant Context
        var activeTenantId = tenantContext.TenantId;

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
