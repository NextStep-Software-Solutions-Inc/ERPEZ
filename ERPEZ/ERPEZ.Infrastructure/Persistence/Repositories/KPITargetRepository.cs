using Sieve.Services;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

#pragma warning disable CS9107 // Parameter is captured into the state of the enclosing type
public class KPITargetRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) : Repository<Domain.Entities.Planning.KPITarget>(context, sieveProcessor), Domain.Interfaces.IKPITargetRepository
#pragma warning restore CS9107
{
    public async Task<(Domain.Entities.Planning.KPITarget? KPITarget, decimal TotalAllocated)> GetKPITargetWithTotalAllocatedAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var result = await context.KPITargets!
            .Where(t => t.Id == id)
            .GroupJoin(
                context.DUKPITargetAssignments!.Where(a => a.KPITargetId == id),
                target => target.Id,
                allocation => allocation.KPITargetId,
                (target, allocations) => new
                {
                    KPITarget = target,
                    TotalAllocated = allocations.Sum(a => a.AllocatedTargetValue)
                })
            .FirstOrDefaultAsync(cancellationToken);

        return result != null ? (result.KPITarget, result.TotalAllocated) : (null, 0);
    }
}
