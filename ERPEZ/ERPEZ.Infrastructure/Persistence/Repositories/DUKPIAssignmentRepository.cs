using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

#pragma warning disable CS9107 // Parameter is captured into the state of the enclosing type
public class DUKPIAssignmentRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) : Repository<Domain.Entities.Planning.DUKPIAssignment>(context, sieveProcessor), Domain.Interfaces.IDUKPIAssignmentRepository
#pragma warning restore CS9107
{
    public async Task<Dictionary<Guid, decimal>> GetTotalAllocatedByKPITargetIdsAsync(IEnumerable<Guid> kpiTargetIds, CancellationToken cancellationToken = default)
    {
        var aggregatedAllocations = await ToListAsync(
            context.DUKPIAssignments!
                .Where(a => kpiTargetIds.Contains(a.KPITargetId))
                .GroupBy(a => a.KPITargetId)
                .Select(g => new { KPITargetId = g.Key, TotalAllocated = g.Sum(a => a.AllocatedTargetValue) }),
            cancellationToken);

        return aggregatedAllocations.ToDictionary(a => a.KPITargetId, a => a.TotalAllocated);
    }
}
