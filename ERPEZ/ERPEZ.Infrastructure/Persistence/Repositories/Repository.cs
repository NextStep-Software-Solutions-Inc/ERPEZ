using EFCore.BulkExtensions;
using ERPEZ.Domain.Common;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class Repository<T>(ApplicationDbContext context, ISieveProcessor sieveProcessor) : IRepository<T> where T : BaseEntity
{

    public async Task AddAsync(T entity, CancellationToken cancellationToken = default)
    {
        await context.Set<T>().AddAsync(entity, cancellationToken);
    }

    public async Task<(IReadOnlyList<T> Entities, int TotalCount)> GetAllAsync(
        SieveModel sieveModel,
        CancellationToken cancellationToken = default)
    {
        // Use context.Set<T>() to make it generic
        var query = context.Set<T>().AsNoTracking();

        var filteredQuery = sieveProcessor.Apply(sieveModel, query, applyPagination: false);
        var totalCount = await filteredQuery.CountAsync(cancellationToken);
        var paginatedResult = sieveProcessor.Apply(sieveModel, filteredQuery, applyFiltering: false, applySorting: false);

        var entities = await paginatedResult.ToListAsync(cancellationToken);
        return (entities, totalCount);
    }
    public async Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Set<T>().FindAsync([id], cancellationToken);
    }

    public void Remove(T entity)
    {
        context.Set<T>().Remove(entity);
    }

    public void Update(T entity)
    {
        context.Set<T>().Update(entity);
    }

    // Implementation of the new bulk methods
    public async Task AddBulkAsync(IList<T> entities, CancellationToken cancellationToken = default)
    {
        await context.BulkInsertAsync(entities, cancellationToken: cancellationToken);
    }

    public async Task UpdateBulkAsync(IList<T> entities, CancellationToken cancellationToken = default)
    {
        await context.BulkUpdateAsync(entities, cancellationToken: cancellationToken);
    }

    public async Task DeleteBulkAsync(IList<T> entities, CancellationToken cancellationToken = default)
    {
        await context.BulkDeleteAsync(entities, cancellationToken: cancellationToken);
    }
}