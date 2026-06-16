using ERPEZ.Domain.Common;
using Sieve.Models;
using System.Linq.Expressions;

namespace ERPEZ.Domain.Interfaces;

public interface IRepository<T> where T : BaseEntity
{
    Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<T?> FindAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);

    IQueryable<T> Query(Expression<Func<T, bool>>? predicate = default, bool? ignoreQueryFilters = false);

    IQueryable<T> IgnoreQueryFilters();

    Task<List<TResult>> ToListAsync<TResult>(IQueryable<TResult> query, CancellationToken cancellationToken = default);

    Task<TEntity?> GetSingleAsync<TEntity>(IQueryable<TEntity> query, CancellationToken cancellationToken = default);

    Task<TEntity?> GetFirstAsync<TEntity>(IQueryable<TEntity> query, CancellationToken cancellationToken = default);

    Task AddAsync(T entity, CancellationToken cancellationToken = default);

    Task AddRangeAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default);

    void Update(T entity);

    void Remove(T entity, bool hardDelete = false);

    // Bulk operations
    Task AddBulkAsync(IList<T> entities, CancellationToken cancellationToken = default);
    Task UpdateBulkAsync(IList<T> entities, CancellationToken cancellationToken = default);
    Task DeleteBulkAsync(IList<T> entities, CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<T> Entities, int TotalCount)> GetAllAsync(SieveModel sieveModel, CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<TDto> Entities, int TotalCount)> GetAllAsync<TDto>(SieveModel sieveModel, Expression<Func<T, TDto>> projection, CancellationToken cancellationToken = default);

    Task<decimal> SumAsync(Expression<Func<T, decimal>> selector, CancellationToken cancellationToken = default);

    // Sieve-filtered aggregate operations
    Task<decimal> SumAsync(SieveModel sieveModel, Expression<Func<T, decimal>> selector, CancellationToken cancellationToken = default);
    Task<List<T>> FindAllAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);
    Task<List<TDto>> GetListAsync<TDto>(IQueryable<TDto> query, CancellationToken cancellationToken = default);
    void RemoveRange(IEnumerable<T> entities);
}