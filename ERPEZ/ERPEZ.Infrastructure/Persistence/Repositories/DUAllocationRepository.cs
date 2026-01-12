using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using Sieve.Services;
using System.Linq.Expressions;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public record AllocationStatsView(decimal TotalAllocated, decimal TotalUtilized);

public class DUAllocationRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) : Repository<Domain.Entities.Planning.DUAllocation>(context, sieveProcessor), Domain.Interfaces.IDUAllocationRepository
{
    private readonly ApplicationDbContext context = context;
    private readonly ISieveProcessor sieveProcessor = sieveProcessor;

    public override async Task<(IReadOnlyList<Domain.Entities.Planning.DUAllocation> Entities, int TotalCount)> GetAllAsync(SieveModel sieveModel, CancellationToken cancellationToken = default)
    {
        IQueryable<Domain.Entities.Planning.DUAllocation> query = context.Set<Domain.Entities.Planning.DUAllocation>()
            .AsNoTracking()
            .Include(du => du.DeliveryUnit)
                .ThenInclude(deliveryUnit => deliveryUnit.Office)
                    .ThenInclude(office => office.Cluster);

        var filteredQuery = sieveProcessor.Apply(sieveModel, query, applyPagination: false);

        var totalCount = await filteredQuery.CountAsync(cancellationToken);

        var paginatedResult = sieveProcessor.Apply(sieveModel, filteredQuery, applyFiltering: false, applySorting: false);

        var entities = await paginatedResult.ToListAsync(cancellationToken);

        return (entities, totalCount);
    }

    public override async Task<(IReadOnlyList<TDto> Entities, int TotalCount)> GetAllAsync<TDto>(SieveModel sieveModel, Expression<Func<Domain.Entities.Planning.DUAllocation, TDto>> projection, CancellationToken cancellationToken = default)
    {
        IQueryable<Domain.Entities.Planning.DUAllocation> query = context.Set<Domain.Entities.Planning.DUAllocation>()
            .AsNoTracking()
            .Include(du => du.DeliveryUnit)
                .ThenInclude(deliveryUnit => deliveryUnit.Office)
                    .ThenInclude(office => office.Cluster);

        var filteredQuery = sieveProcessor.Apply(sieveModel, query, applyPagination: false);

        var totalCount = await filteredQuery.CountAsync(cancellationToken);

        var paginatedResult = sieveProcessor.Apply(sieveModel, filteredQuery, applyFiltering: false, applySorting: false);

        var entities = await paginatedResult.Select(projection).ToListAsync(cancellationToken);

        return (entities, totalCount);
    }

    public async Task<(decimal TotalAllocated, decimal TotalUtilized)> GetAllocationStatsAsync(CancellationToken cancellationToken = default)
    {
        // DUFundAllocations table not yet available, so TotalUtilized is 0 for now
        // Single database round trip with subquery for maximum performance
        const string sql = @"
            SELECT 
                COALESCE((SELECT SUM(""Amount"") FROM ""DUAllocations""), 0) as TotalAllocated,
                0 as TotalUtilized";

        var result = await context.Set<AllocationStatsView>()
            .FromSqlRaw(sql)
            .FirstOrDefaultAsync(cancellationToken);

        return result != null ? (result.TotalAllocated, result.TotalUtilized) : (0, 0);
    }
}
