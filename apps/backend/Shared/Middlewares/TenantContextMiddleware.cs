using System.Security.Claims;
using ERPEZ.Shared.Interfaces;
using Microsoft.AspNetCore.Http;

namespace ERPEZ.Shared.Middlewares;

/// <summary>
/// Middleware that resolves and populates ITenantContextService from the authenticated user's JWT claims or headers.
/// </summary>
public class TenantContextMiddleware(RequestDelegate next)
{
    private const string claimTenantId = "tenant_id";
    private const string headerTenantId = "X-Tenant-Id";

    public async Task InvokeAsync(HttpContext context, ITenantContextService tenantContextService)
    {
        // 1. Prefer JWT claim tenant_id
        var tenantIdClaim = context.User.FindFirstValue(claimTenantId) 
            ?? context.User.FindFirstValue("tenantId");

        if (!string.IsNullOrWhiteSpace(tenantIdClaim) && Guid.TryParse(tenantIdClaim, out var claimTenantGuid))
        {
            tenantContextService.SetTenantId(claimTenantGuid);
        }
        // 2. Controlled fallback: X-Tenant-Id header
        else if (context.Request.Headers.TryGetValue(headerTenantId, out var headerTenantVal) &&
                 Guid.TryParse(headerTenantVal.FirstOrDefault(), out var headerTenantGuid))
        {
            tenantContextService.SetTenantId(headerTenantGuid);
        }

        await next(context);
    }
}
