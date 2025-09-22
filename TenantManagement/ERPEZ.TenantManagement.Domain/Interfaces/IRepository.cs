using ERPEZ.TenantManagement.Domain.Common;
using Sieve.Models;

namespace ERPEZ.TenantManagement.Domain.Interfaces;

public interface IRepository<T> where T : BaseEntity
{
    Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(T entity, CancellationToken cancellationToken = default);
    void Update(T entity);
    void Remove(T entity);

    // Add these methods for bulk operations
    Task AddBulkAsync(IList<T> entities, CancellationToken cancellationToken = default);
    Task UpdateBulkAsync(IList<T> entities, CancellationToken cancellationToken = default);
    Task DeleteBulkAsync(IList<T> entities, CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<T> Entities, int TotalCount)> GetAllAsync(
        SieveModel sieveModel,
        CancellationToken cancellationToken = default);
}