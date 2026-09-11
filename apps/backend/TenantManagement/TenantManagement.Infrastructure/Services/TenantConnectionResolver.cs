using ERPEZ.Shared.Interfaces;
using ERPEZ.Shared.Models;
using ERPEZ.TenantManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace ERPEZ.TenantManagement.Infrastructure.Services;

/// <summary>
/// Post-authorization connection resolver.
/// Retrieves trusted operational database connection metadata for an authorized tenant.
/// Decrypts credentials once per request into scoped memory.
/// </summary>
public class TenantConnectionResolver(
    ApplicationDbContext dbContext,
    IConfiguration configuration,
    IHostEnvironment env) : ITenantConnectionResolver
{
    public async Task<TenantDatabaseConnectionInfo?> ResolveConnectionInfoAsync(
        Guid authorizedTenantId,
        CancellationToken cancellationToken = default)
    {
        var setting = await dbContext.TenantSettings!
            .AsNoTracking()
            .Where(ts => ts.TenantId == authorizedTenantId && !ts.IsDeleted)
            .Select(ts => new { ts.DbConnectionString })
            .FirstOrDefaultAsync(cancellationToken);

        var rawConnectionString = setting?.DbConnectionString;

        // In development environments, allow seeded dev tenant with empty connection string to use DefaultConnection
        if (string.IsNullOrWhiteSpace(rawConnectionString))
        {
            if (env.IsDevelopment())
            {
                rawConnectionString = configuration.GetConnectionString("DefaultConnection");
            }
        }

        if (string.IsNullOrWhiteSpace(rawConnectionString))
        {
            throw new InvalidOperationException($"No valid database connection string found for authorized tenant {authorizedTenantId}.");
        }

        return new TenantDatabaseConnectionInfo(authorizedTenantId, rawConnectionString);
    }
}
