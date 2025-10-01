using ERPEZ.Domain.Common;
using Sieve.Models;
using System.Linq.Expressions;

namespace ERPEZ.Domain.Interfaces;


public interface IRepository<T> where T : BaseEntity
{
    Task<T?> GetByIdAsync(
        Guid id,
        bool? isDeleted = null,
        CancellationToken cancellationToken = default);

    Task AddAsync(T entity, CancellationToken cancellationToken = default);

    void Update(T entity);

    void Remove(T entity);

    // Bulk operations
    Task AddBulkAsync(IList<T> entities, CancellationToken cancellationToken = default);
    Task UpdateBulkAsync(IList<T> entities, CancellationToken cancellationToken = default);
    Task DeleteBulkAsync(IList<T> entities, CancellationToken cancellationToken = default);

    // Exists / find
    Task<T?> FindAsync(
        Expression<Func<T, bool>> predicate,
        bool? isDeleted = null,
        CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<T> Entities, int TotalCount)> GetAllAsync(
        SieveModel sieveModel,
        bool? isDeleted = null,
        CancellationToken cancellationToken = default);
}
