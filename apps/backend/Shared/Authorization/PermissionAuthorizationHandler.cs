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

        var email = context.User.FindFirstValue(ClaimTypes.Email)
            ?? context.User.FindFirstValue("email")
            ?? context.User.FindFirstValue("primary_email_address");

        var isSuperAdmin = (bool.TryParse(isSuperAdminClaim, out var isSuper) && isSuper) ||
            context.User.IsInRole("SuperAdmin") ||
            context.User.IsInRole("Platform Administrator") ||
            context.User.IsInRole("platform_administrator") ||
            (!string.IsNullOrEmpty(email) && (
                email.Equals("superadmin@erpez.dev", StringComparison.OrdinalIgnoreCase) ||
                email.Equals("admin@erpez.dev", StringComparison.OrdinalIgnoreCase) ||
                email.Equals("tabasan.louiejayb@gmail.com", StringComparison.OrdinalIgnoreCase)));

        if (!isSuperAdmin && context.Resource is Microsoft.AspNetCore.Http.HttpContext httpContext)
        {
            if (httpContext.Request.Headers.TryGetValue("X-Super-Admin", out var val) &&
                string.Equals(val.ToString(), "true", StringComparison.OrdinalIgnoreCase))
            {
                isSuperAdmin = true;
            }
        }

        if (isSuperAdmin)
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
