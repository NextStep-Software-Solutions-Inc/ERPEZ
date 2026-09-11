using ERPEZ.TenantManagement.Domain.Entities;

namespace ERPEZ.TenantManagement.Domain.Interfaces;

/// <summary>
/// Append-only repository interface for TenantAuditLog records.
/// Excludes modification and deletion methods by design.
/// </summary>
public interface ITenantAuditRepository
{
    Task AddAsync(TenantAuditLog auditLog, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TenantAuditLog>> GetByTenantIdAsync(Guid tenantId, int limit = 50, CancellationToken cancellationToken = default);
}
