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
    ISecretEncryptionService encryptionService,
    IConfiguration configuration,
    IHostEnvironment env) : ITenantConnectionResolver
{
    public async Task<TenantDatabaseConnectionInfo?> ResolveConnectionInfoAsync(
        Guid authorizedTenantId,
        CancellationToken cancellationToken = default)
    {
        // Query dedicated TenantOperationalDatabase entity strictly post-authorization
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
                resolvedConnectionString = configuration.GetConnectionString("DefaultConnection");
            }
        }

        if (string.IsNullOrWhiteSpace(resolvedConnectionString))
        {
            throw new InvalidOperationException($"No valid database connection string found for authorized tenant {authorizedTenantId}.");
        }

        return new TenantDatabaseConnectionInfo(authorizedTenantId, resolvedConnectionString);
    }
}
