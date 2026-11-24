using ERPEZ.Shared.Enums;
using ERPEZ.Shared.Interfaces;
using ERPEZ.Shared.Models;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Npgsql;

namespace ERPEZ.Shared.Services;

/// <summary>
/// Read-only tenant connection resolver backed by IMemoryCache.
/// Accurately differentiates SaaS (shared operational database) from On-Premise (dedicated physical database).
/// Strictly prevents caching of tenant-specific connection strings for SaaS tenants while maintaining
/// cache invalidation for On-Premise database credentials.
/// </summary>
public class CachedTenantConnectionResolver(
    IConfiguration configuration,
    ISecretEncryptionService encryptionService,
    IMemoryCache cache,
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

        if (string.IsNullOrWhiteSpace(sharedConnStr))
        {
            return null;
        }

        // 1. If TenancyMode is unspecified, check in-memory cache to prevent control plane query storms during concurrent jobs
        var modeCacheKey = $"tenant:mode:{authorizedTenantId}";
        if (!tenancyMode.HasValue && cache.TryGetValue(modeCacheKey, out TenancyMode cachedMode))
        {
            tenancyMode = cachedMode;
        }

        // 2. If TenancyMode is already known to be SaaS, return shared operational DB immediately
        // Invariant: No tenant-specific connection string is cached for SaaS tenants.
        if (tenancyMode == TenancyMode.SaaS)
        {
            return new TenantDatabaseConnectionInfo(authorizedTenantId, sharedConnStr);
        }

        // 3. If TenancyMode is still unspecified, query control plane to determine deployment topology
        if (!tenancyMode.HasValue)
        {
            try
            {
                await using var controlConn = new NpgsqlConnection(sharedConnStr);
                await controlConn.OpenAsync(cancellationToken);

                const string modeSql = """
                    SELECT COALESCE("TenancyMode"::text, 'SaaS')
                    FROM "Tenants"
                    WHERE "Id" = @tenantId AND "IsDeleted" = false
                    LIMIT 1;
                """;

                await using var modeCmd = new NpgsqlCommand(modeSql, controlConn);
                modeCmd.Parameters.AddWithValue("tenantId", authorizedTenantId);
                var rawMode = await modeCmd.ExecuteScalarAsync(cancellationToken) as string;

                if (!string.IsNullOrWhiteSpace(rawMode) &&
                    Enum.TryParse<TenancyMode>(rawMode, true, out var detectedMode))
                {
                    cache.Set(modeCacheKey, detectedMode, TimeSpan.FromMinutes(10));

                    if (detectedMode == TenancyMode.SaaS)
                    {
                        return new TenantDatabaseConnectionInfo(authorizedTenantId, sharedConnStr);
                    }

                    tenancyMode = detectedMode;
                }
            }
            catch
            {
                if (env.IsDevelopment())
                {
                    cache.Set(modeCacheKey, TenancyMode.SaaS, TimeSpan.FromMinutes(10));
                    return new TenantDatabaseConnectionInfo(authorizedTenantId, sharedConnStr);
                }
            }
        }

        // 3. On-Premise Mode: Dedicated physical database resolved from TenantOperationalDatabases and cached
        var cacheKey = $"tenant:conn:{authorizedTenantId}";

        return await cache.GetOrCreateAsync(cacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10);

            try
            {
                await using var conn = new NpgsqlConnection(sharedConnStr);
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
                                return new TenantDatabaseConnectionInfo(authorizedTenantId, decrypted, TenancyMode.OnPremise);
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
                return new TenantDatabaseConnectionInfo(authorizedTenantId, sharedConnStr, TenancyMode.SaaS);
            }

            // Fallback for On-Premise: deterministic DB naming convention
            var tenantDbName = $"erpez_tenant_{authorizedTenantId:N}";
            var builder = new NpgsqlConnectionStringBuilder(sharedConnStr) { Database = tenantDbName };
            return new TenantDatabaseConnectionInfo(authorizedTenantId, builder.ConnectionString, TenancyMode.OnPremise);
        });
    }

    public void InvalidateConnection(Guid tenantId)
    {
        cache.Remove($"tenant:mode:{tenantId}");
        cache.Remove($"tenant:conn:{tenantId}");
    }
}
