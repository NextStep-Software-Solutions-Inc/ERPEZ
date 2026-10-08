using ERPEZ.Shared.Enums;
using ERPEZ.Shared.Interfaces;
using ERPEZ.TenantManagement.Application.Common.Interfaces;
using ERPEZ.TenantManagement.Infrastructure.Persistence;
using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Npgsql;

namespace ERPEZ.TenantManagement.Infrastructure.Services;

/// <summary>
/// Durable, idempotent tenant database provisioner executed by Hangfire background workers.
/// Enforces distributed locking, zero plaintext credential leakage, and atomic state transitions.
/// </summary>
public class TenantDatabaseProvisioner(
    ApplicationDbContext controlDbContext,
    ISecretEncryptionService encryptionService,
    IConfiguration configuration,
    ILogger<TenantDatabaseProvisioner> logger,
    ITenantConnectionResolver? connectionResolver = null) : ITenantDatabaseProvisioner
{
    public async Task ProvisionTenantDatabaseAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        IDisposable? lockHandle = null;
        try
        {
            // 1. Acquire tenant-specific distributed lock across the entire provisioning lifecycle
            if (JobStorage.Current != null)
            {
                lockHandle = JobStorage.Current.GetConnection()
                    .AcquireDistributedLock($"tenant-provisioning:{tenantId}", TimeSpan.FromMinutes(10));
            }
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to acquire distributed lock for tenant {TenantId}. Execution will proceed with database-level concurrency checks.", tenantId);
        }

        try
        {
            // 2. Fetch tenant and its operational database entity
            var tenant = await controlDbContext.Tenants!
                .Include(t => t.OperationalDatabase)
                .FirstOrDefaultAsync(t => t.Id == tenantId, cancellationToken);

            if (tenant == null)
            {
                logger.LogError("Tenant {TenantId} not found in Control DB.", tenantId);
                return;
            }

            var opDb = tenant.OperationalDatabase;
            if (opDb == null)
            {
                opDb = new Domain.Entities.TenantOperationalDatabase
                {
                    TenantId = tenantId,
                    DatabaseServer = "localhost",
                    DatabaseName = $"erpez_tenant_{tenantId:N}",
                    ProvisioningState = TenantProvisioningState.Pending,
                    RetryCount = 0
                };
                tenant.OperationalDatabase = opDb;
                await controlDbContext.SaveChangesAsync(cancellationToken);
            }

            // 3. Idempotency check: if already Ready, exit immediately
            if (opDb.ProvisioningState == TenantProvisioningState.Ready && tenant.ProvisioningState == TenantProvisioningState.Ready)
            {
                logger.LogInformation("Tenant {TenantId} operational database is already Ready.", tenantId);
                return;
            }

            // 4. Update attempt state at start of attempt
            opDb.RetryCount++;
            opDb.LastAttemptedAtUtc = DateTime.UtcNow;
            opDb.ProvisioningState = TenantProvisioningState.Provisioning;
            tenant.ProvisioningState = TenantProvisioningState.Provisioning;
            await controlDbContext.SaveChangesAsync(cancellationToken);

            // 5. Establish administrative connection to create physical PostgreSQL database
            var defaultConnection = configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("DefaultConnection configuration is missing.");

            var adminBuilder = new NpgsqlConnectionStringBuilder(defaultConnection)
            {
                Database = "postgres" // Connect to admin postgres DB to run CREATE DATABASE
            };

            var dbName = string.IsNullOrWhiteSpace(opDb.DatabaseName) ? $"erpez_tenant_{tenantId:N}" : opDb.DatabaseName;
            opDb.DatabaseName = dbName;

            await using (var adminConn = new NpgsqlConnection(adminBuilder.ConnectionString))
            {
                await adminConn.OpenAsync(cancellationToken);

                // Check if database exists
                await using var checkCmd = new NpgsqlCommand("SELECT 1 FROM pg_database WHERE datname = @name;", adminConn);
                checkCmd.Parameters.AddWithValue("name", dbName);
                var exists = await checkCmd.ExecuteScalarAsync(cancellationToken);

                if (exists == null)
                {
                    // Create tenant-specific physical database
                    await using var createCmd = new NpgsqlCommand($"CREATE DATABASE \"{dbName}\" WITH ENCODING 'UTF8';", adminConn);
                    await createCmd.ExecuteNonQueryAsync(cancellationToken);
                    logger.LogInformation("Physical PostgreSQL database {DbName} created for tenant {TenantId}.", dbName, tenantId);
                }
            }

            // 6. Build tenant-specific connection string
            var tenantConnBuilder = new NpgsqlConnectionStringBuilder(defaultConnection)
            {
                Database = dbName
            };
            var tenantConnectionString = tenantConnBuilder.ConnectionString;

            // 7. Apply operational migrations to the newly created physical database
            var dbOptions = new DbContextOptionsBuilder<ERPEZ.Infrastructure.Persistence.ApplicationDbContext>()
                .UseNpgsql(tenantConnectionString, npgsqlOptions =>
                    npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "public"))
                .Options;

            await using (var tenantDbContext = new ERPEZ.Infrastructure.Persistence.ApplicationDbContext(dbOptions))
            {
                await tenantDbContext.Database.MigrateAsync(cancellationToken);
                logger.LogInformation("EF Core migrations applied to {DbName} for tenant {TenantId}.", dbName, tenantId);
            }

            // 8. Encrypt connection string in-memory strictly before Control DB transaction
            var encryptedConnStr = encryptionService.Encrypt(tenantConnectionString, 1);

            // 9. Atomic Control DB commit: both TenantOperationalDatabase and Tenant transition to Ready together
            await using var tx = await controlDbContext.Database.BeginTransactionAsync(cancellationToken);
            try
            {
                opDb.EncryptedConnectionString = encryptedConnStr;
                opDb.EncryptionKeyVersion = 1;
                opDb.ProvisioningState = TenantProvisioningState.Ready;
                opDb.ProvisionedAtUtc = DateTime.UtcNow;
                opDb.LastError = null;

                tenant.ProvisioningState = TenantProvisioningState.Ready;

                await controlDbContext.SaveChangesAsync(cancellationToken);
                await tx.CommitAsync(cancellationToken);
                connectionResolver?.InvalidateConnection(tenantId);
                logger.LogInformation("Tenant {TenantId} and its operational database successfully transitioned to Ready.", tenantId);
            }
            catch
            {
                await tx.RollbackAsync(cancellationToken);
                throw;
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to provision operational database for tenant {TenantId}.", tenantId);

            try
            {
                var tenant = await controlDbContext.Tenants!
                    .Include(t => t.OperationalDatabase)
                    .FirstOrDefaultAsync(t => t.Id == tenantId, CancellationToken.None);

                if (tenant?.OperationalDatabase != null)
                {
                    tenant.OperationalDatabase.LastError = ex.Message;
                    if (tenant.OperationalDatabase.RetryCount >= 3)
                    {
                        tenant.OperationalDatabase.ProvisioningState = TenantProvisioningState.Failed;
                        tenant.ProvisioningState = TenantProvisioningState.Failed;
                    }
                    else
                    {
                        // Intermediate state allows Hangfire to retry with exponential backoff
                        tenant.OperationalDatabase.ProvisioningState = TenantProvisioningState.Provisioning;
                        tenant.ProvisioningState = TenantProvisioningState.Provisioning;
                    }
                    await controlDbContext.SaveChangesAsync(CancellationToken.None);
                    connectionResolver?.InvalidateConnection(tenantId);
                }
            }
            catch (Exception innerEx)
            {
                logger.LogError(innerEx, "Failed to record failure state for tenant {TenantId}.", tenantId);
            }

            throw; // Inform Hangfire of job failure so retry policy executes
        }
        finally
        {
            lockHandle?.Dispose();
        }
    }
}
