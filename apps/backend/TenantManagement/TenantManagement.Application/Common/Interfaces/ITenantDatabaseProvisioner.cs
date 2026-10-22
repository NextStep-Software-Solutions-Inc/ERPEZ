namespace ERPEZ.TenantManagement.Application.Common.Interfaces;

/// <summary>
/// Durable, idempotent background provisioner for physical PostgreSQL tenant databases.
/// Runs under a tenant-scoped distributed lock to guarantee exactly-once database creation,
/// schema migration, and seed execution.
/// </summary>
public interface ITenantDatabaseProvisioner
{
    Task ProvisionTenantDatabaseAsync(Guid tenantId, CancellationToken cancellationToken = default);
}
