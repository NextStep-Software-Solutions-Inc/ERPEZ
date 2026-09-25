using System.Security.Claims;
using ERPEZ.Shared.Interfaces;
using ERPEZ.Shared.Middlewares;
using ERPEZ.Shared.Models;
using Microsoft.AspNetCore.Http;

namespace ERPEZ.Shared.Services;

/// <summary>
/// Scoped request context implementation storing validated tenant governance and infrastructure connection state.
/// </summary>
public sealed class TenantRequestContext(IHttpContextAccessor? httpContextAccessor = null) : ITenantRequestContext
{
    public TenantAccessContext? AccessContext { get; private set; }
    public TenantDatabaseConnectionInfo? ConnectionInfo { get; private set; }

    public Guid? TenantId
    {
        get
        {
            if (AccessContext?.TenantId != null)
            {
                return AccessContext.TenantId;
            }

            var httpContext = httpContextAccessor?.HttpContext;
            if (httpContext == null) return null;

            if (httpContext.Items.TryGetValue(TenantResolutionMiddleware.candidateTenantItemKey, out var itemVal) &&
                itemVal is Guid guidVal)
            {
                return guidVal;
            }

            if (httpContext.Request.Headers.TryGetValue("X-Tenant-Id", out var headerVal))
            {
                var raw = headerVal.FirstOrDefault();
                if (Guid.TryParse(raw, out var parsedHeader))
                {
                    return parsedHeader;
                }
            }

            if (httpContext.Request.Query.TryGetValue("tenantId", out var queryVal))
            {
                var raw = queryVal.FirstOrDefault();
                if (Guid.TryParse(raw, out var parsedQuery))
                {
                    return parsedQuery;
                }
            }

            var tenantClaim = httpContext.User.FindFirstValue("tenant_id") 
                ?? httpContext.User.FindFirstValue("tenantId");
            if (Guid.TryParse(tenantClaim, out var parsedClaim))
            {
                return parsedClaim;
            }

            return null;
        }
    }

    public bool IsResolved => AccessContext != null && ConnectionInfo != null;

    public void Initialize(TenantAccessContext accessContext, TenantDatabaseConnectionInfo connectionInfo)
    {
        AccessContext = accessContext ?? throw new ArgumentNullException(nameof(accessContext));
        ConnectionInfo = connectionInfo ?? throw new ArgumentNullException(nameof(connectionInfo));
    }
}
