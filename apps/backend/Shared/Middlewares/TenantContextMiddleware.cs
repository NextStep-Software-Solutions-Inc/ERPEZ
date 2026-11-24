using Microsoft.AspNetCore.Http;

namespace ERPEZ.Shared.Middlewares;

/// <summary>
/// Legacy composite middleware. Replaced by TenantResolutionMiddleware and TenantAccessValidationMiddleware.
/// </summary>
[Obsolete("Use TenantResolutionMiddleware followed by TenantAccessValidationMiddleware.")]
public class TenantContextMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        await next(context);
    }
}
