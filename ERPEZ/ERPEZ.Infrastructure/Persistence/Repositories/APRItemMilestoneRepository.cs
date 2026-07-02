using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class APRItemMilestoneRepository : Repository<APRItemMilestone>, IAPRItemMilestoneRepository
{
    private readonly ApplicationDbContext context;

    public APRItemMilestoneRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
    }

    public async Task<List<APRItemMilestone>> GetByAPRItemIdAsync(Guid aprItemId, CancellationToken cancellationToken = default)
    {
        return await context.Set<APRItemMilestone>()
            .AsNoTracking()
            .Where(m => m.APRItemId == aprItemId && !m.IsDeleted)
            .Include(m => m.ProcurementActivityType)
            .OrderBy(m => m.ScheduledDate)
            .ToListAsync(cancellationToken);
    }
}
