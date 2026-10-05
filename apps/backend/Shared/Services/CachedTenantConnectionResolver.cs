using ERPEZ.Shared.Interfaces;
using ERPEZ.Shared.Models;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Npgsql;

namespace ERPEZ.Shared.Services;

/// <summary>
/// Read-only tenant connection resolver backed by IMemoryCache.
/// Directly queries the Control Plane database using lightweight Npgsql commands,
/// decrypting operational database credentials without coupling to TenantManagement MediatR handlers or assemblies.
/// </summary>
public class CachedTenantConnectionResolver(
    IConfiguration configuration,
    ISecretEncryptionService encryptionService,
    IMemoryCache cache,
    IHostEnvironment env) : ITenantConnectionResolver
{
    public async Task<TenantDatabaseConnectionInfo?> ResolveConnectionInfoAsync(
        Guid authorizedTenantId,
        CancellationToken cancellationToken = default)
    {
        var cacheKey = $"tenant:conn:{authorizedTenantId}";

        return await cache.GetOrCreateAsync(cacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10);

            var controlConnStr = configuration.GetConnectionString("DefaultConnection");
            if (string.IsNullOrWhiteSpace(controlConnStr))
            {
                return null;
            }

            try
            {
                await using var conn = new NpgsqlConnection(controlConnStr);
                await conn.OpenAsync(cancellationToken);

                const string sql = """
                    SELECT "EncryptedConnectionString", "EncryptionKeyVersion"
                    FROM "TenantOperationalDatabases"
                    WHERE "TenantId" = @tenantId AND "IsDeleted" = false AND "ProvisioningState"::text IN ('Ready', '1')
                    LIMIT 1;
                """;

                await using var cmd = new NpgsqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("tenantId", authorizedTenantId);
                await using var reader = await cmd.ExecuteReaderAsync(cancellationToken);

                if (await reader.ReadAsync(cancellationToken))
                {
                    if (!reader.IsDBNull(0))
                    {
                        var encrypted = reader.GetString(0);
                        if (!string.IsNullOrWhiteSpace(encrypted))
                        {
                            var version = reader.GetInt32(1);
                            var decrypted = encryptionService.Decrypt(encrypted, version);
                            if (!string.IsNullOrWhiteSpace(decrypted))
                            {
                                return new TenantDatabaseConnectionInfo(authorizedTenantId, decrypted);
                            }
                        }
                    }
                }
            }
            catch
            {
                // Fall through to fallback below
            }

            // In development environments, allow seeded dev tenant to use DefaultConnection
            if (env.IsDevelopment())
            {
                return new TenantDatabaseConnectionInfo(authorizedTenantId, controlConnStr);
            }

            // Fallback: Deterministic DB naming convention in production if provisioning is local/standard
            var tenantDbName = $"erpez_tenant_{authorizedTenantId:N}";
            var builder = new NpgsqlConnectionStringBuilder(controlConnStr) { Database = tenantDbName };
            return new TenantDatabaseConnectionInfo(authorizedTenantId, builder.ConnectionString);
        });
    }
}
