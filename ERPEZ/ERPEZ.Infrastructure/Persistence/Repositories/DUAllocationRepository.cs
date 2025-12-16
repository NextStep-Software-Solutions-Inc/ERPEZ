using Microsoft.EntityFrameworkCore;
using Sieve.Services;
using System.Linq.Expressions;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public record AllocationStatsView(decimal TotalAllocated, decimal TotalUtilized);

public class DUAllocationRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) : Repository<Domain.Entities.Planning.DUAllocation>(context, sieveProcessor), Domain.Interfaces.IDUAllocationRepository
{
    private readonly ApplicationDbContext context = context;

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
