using EFCore.BulkExtensions;
using ERPEZ.TenantManagement.Domain.Common;
using ERPEZ.TenantManagement.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using Sieve.Services;
using System.Linq.Expressions;

namespace ERPEZ.TenantManagement.Infrastructure.Persistence.Repositories;

public class Repository<T>(ApplicationDbContext context, ISieveProcessor sieveProcessor) : IRepository<T> where T : BaseEntity
{
    public async Task AddAsync(T entity, CancellationToken cancellationToken = default)
    {
        await context.Set<T>().AddAsync(entity, cancellationToken);
    }
    public async Task<(IReadOnlyList<T> Entities, int TotalCount)> GetAllAsync(
       SieveModel sieveModel,
       bool? isDeleted = null,
       Func<IQueryable<T>, IQueryable<T>>? include = null,
       CancellationToken cancellationToken = default)
    {
        IQueryable<T> query = context.Set<T>().AsNoTracking();

        query = ApplyIsDeletedFilter(query, isDeleted);

        // Apply optional includes
        if (include != null)
            query = include(query);

        var filteredQuery = sieveProcessor.Apply(sieveModel, query, applyPagination: false);

        var totalCount = await filteredQuery.CountAsync(cancellationToken);

        var paginatedResult = sieveProcessor.Apply(
            sieveModel,
            filteredQuery,
            applyFiltering: false,
            applySorting: false
        );

        var entities = await paginatedResult.ToListAsync(cancellationToken);

        return (entities, totalCount);
    }

    public async Task<T?> GetByIdAsync(
        Guid id,
        bool? isDeleted = null,
        Func<IQueryable<T>, IQueryable<T>>? include = null,
        CancellationToken cancellationToken = default)
    {
        IQueryable<T> query = context.Set<T>();

        query = ApplyIsDeletedFilter(query, isDeleted);

        if (include != null)
            query = include(query);

        return await query.FirstOrDefaultAsync(e => EF.Property<Guid>(e, "Id") == id, cancellationToken);
    }

    public async Task<T?> FindAsync(
            Expression<Func<T, bool>> predicate,
            bool? isDeleted = null,
            Func<IQueryable<T>, IQueryable<T>>? include = null,
            CancellationToken cancellationToken = default)
    {
        IQueryable<T> query = context.Set<T>();

        query = ApplyIsDeletedFilter(query, isDeleted);

        if (include != null)
            query = include(query);

        return await query.FirstOrDefaultAsync(predicate, cancellationToken);
    }

    public void Remove(T entity)
    {
        context.Set<T>().Remove(entity);
    }

    public void Update(T entity)
    {
        context.Set<T>().Update(entity);
    }

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

    private static IQueryable<T> ApplyIsDeletedFilter(IQueryable<T> query, bool? isDeleted)
    {
        if (typeof(T).GetProperty("IsDeleted") != null)
        {
            if (isDeleted == true)
            {
                query = query.Where(e => EF.Property<bool>(e, "IsDeleted") == true);
            }
            else if (isDeleted == false)
            {
                query = query.Where(e => EF.Property<bool>(e, "IsDeleted") == false);
            }
        }

        return query;
    }
}
