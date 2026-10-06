using ERPEZ.Shared.Enums;
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
/// Differentiates SaaS (shared operational database) from On-Premise (decrypted dedicated database).
/// </summary>
public class TenantConnectionResolver(
    ApplicationDbContext dbContext,
    ISecretEncryptionService encryptionService,
    IConfiguration configuration,
    IHostEnvironment env) : ITenantConnectionResolver
{
    public Task<TenantDatabaseConnectionInfo?> ResolveConnectionInfoAsync(
        Guid authorizedTenantId,
        CancellationToken cancellationToken = default)
    {
        return ResolveConnectionInfoAsync(authorizedTenantId, null, cancellationToken);
    }

    public async Task<TenantDatabaseConnectionInfo?> ResolveConnectionInfoAsync(
        Guid authorizedTenantId,
        TenancyMode? tenancyMode,
        CancellationToken cancellationToken = default)
    {
        var sharedConnStr = configuration.GetConnectionString("OperationalConnection")
            ?? configuration.GetConnectionString("DefaultConnection");

        // 1. If TenancyMode is known to be SaaS, return shared operational connection immediately
        if (tenancyMode == TenancyMode.SaaS)
        {
            if (!string.IsNullOrWhiteSpace(sharedConnStr))
            {
                return new TenantDatabaseConnectionInfo(authorizedTenantId, sharedConnStr);
            }
        }

        // 2. Query tenant deployment mode if unspecified
        var tenant = await dbContext.Tenants!
            .AsNoTracking()
            .Where(t => t.Id == authorizedTenantId && !t.IsDeleted)
            .Select(t => new { t.TenancyMode })
            .FirstOrDefaultAsync(cancellationToken);

        if (tenant?.TenancyMode == TenancyMode.SaaS)
        {
            if (!string.IsNullOrWhiteSpace(sharedConnStr))
            {
                return new TenantDatabaseConnectionInfo(authorizedTenantId, sharedConnStr);
            }
        }

        // 3. Dedicated On-Premise operational database resolution
        var opDb = await dbContext.TenantOperationalDatabases!
            .AsNoTracking()
            .Where(db => db.TenantId == authorizedTenantId && !db.IsDeleted)
            .Select(db => new
            {
                db.EncryptedConnectionString,
                db.EncryptionKeyVersion,
                db.ProvisioningState
            })
            .FirstOrDefaultAsync(cancellationToken);

        string? resolvedConnectionString = null;

        if (opDb != null && !string.IsNullOrWhiteSpace(opDb.EncryptedConnectionString))
        {
            try
            {
                resolvedConnectionString = encryptionService.Decrypt(
                    opDb.EncryptedConnectionString,
                    opDb.EncryptionKeyVersion);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException(
                    $"Failed to decrypt operational database credentials for authorized tenant {authorizedTenantId}.", ex);
            }
        }

        // Backward compatibility fallback to legacy TenantSettings if TenantOperationalDatabase record is not yet populated
        if (string.IsNullOrWhiteSpace(resolvedConnectionString))
        {
            var legacySetting = await dbContext.TenantSettings!
                .AsNoTracking()
                .Where(ts => ts.TenantId == authorizedTenantId && !ts.IsDeleted)
                .Select(ts => new { ts.DbConnectionString })
                .FirstOrDefaultAsync(cancellationToken);

            resolvedConnectionString = legacySetting?.DbConnectionString;
        }

        // In development environments, allow seeded dev tenant with empty connection string to use DefaultConnection
        if (string.IsNullOrWhiteSpace(resolvedConnectionString))
        {
            if (env.IsDevelopment())
            {
                resolvedConnectionString = sharedConnStr;
            }
        }

        if (string.IsNullOrWhiteSpace(resolvedConnectionString))
        {
            throw new InvalidOperationException($"No valid database connection string found for authorized tenant {authorizedTenantId}.");
        }

        return new TenantDatabaseConnectionInfo(authorizedTenantId, resolvedConnectionString);
    }

    public void InvalidateConnection(Guid tenantId)
    {
        // Scoped direct resolver does not maintain cross-request cache.
    }
}
