using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.TenantManagement.Infrastructure.Persistence.Repositories;

/// <summary>
/// Append-only repository implementation for TenantAuditLog records.
/// </summary>
public class TenantAuditRepository(ApplicationDbContext context) : ITenantAuditRepository
{
    public async Task AddAsync(TenantAuditLog auditLog, CancellationToken cancellationToken = default)
    {
        await context.TenantAuditLogs!.AddAsync(auditLog, cancellationToken);
    }

    public async Task<IReadOnlyList<TenantAuditLog>> GetByTenantIdAsync(Guid tenantId, int limit = 50, CancellationToken cancellationToken = default)
    {
        return await context.TenantAuditLogs!
            .AsNoTracking()
            .Where(al => al.TenantId == tenantId)
            .OrderByDescending(al => al.CreatedAt)
            .Take(limit)
            .ToListAsync(cancellationToken);
    }
}
