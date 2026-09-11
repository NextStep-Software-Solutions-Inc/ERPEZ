using ERPEZ.Shared.Configuration;
using ERPEZ.Shared.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

namespace ERPEZ.Shared.Services;

/// <summary>
/// Scoped provider for EF Core to obtain the operational database connection string.
/// Enforces gated development fallback and fails closed in all other unauthorized scenarios.
/// </summary>
public sealed class TenantConnectionProvider(
    ITenantRequestContext requestContext,
    IConfiguration configuration,
    IHostEnvironment env,
    IOptions<TenantRoutingOptions> routingOptions) : ITenantConnectionProvider
{
    public string GetConnectionString()
    {
        // 1. Authorized runtime request: returns scoped verified connection string
        if (requestContext.IsResolved && requestContext.ConnectionInfo != null)
        {
            return requestContext.ConnectionInfo.ConnectionString;
        }

        // 2. Gated development fallback: strictly for local tooling/dev startup
        if (env.IsDevelopment() && routingOptions.Value.AllowDevelopmentFallback)
        {
            var fallback = configuration.GetConnectionString("DefaultConnection");
            if (!string.IsNullOrWhiteSpace(fallback))
            {
                return fallback;
            }
        }

        // 3. Fail closed: no operational connection permitted without authorized tenant context
        throw new InvalidOperationException("Tenant operational database connection is not available for this request.");
    }
}
