using Sieve.Services;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class KPITargetRepository : Repository<Domain.Entities.Planning.KPITarget>, Domain.Interfaces.IKPITargetRepository
{
    private readonly ApplicationDbContext context;

    public KPITargetRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
    }
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
