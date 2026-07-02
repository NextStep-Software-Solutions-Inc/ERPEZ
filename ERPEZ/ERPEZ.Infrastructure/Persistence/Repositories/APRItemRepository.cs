using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class APRItemRepository : Repository<APRItem>, IAPRItemRepository
{
    private readonly ApplicationDbContext context;

    public APRItemRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
    }

    public async Task<List<APRItem>> GetByAPRIdAsync(Guid aprId, CancellationToken cancellationToken = default)
    {
        return await context.Set<APRItem>()
            .AsNoTracking()
            .Where(i => i.APRId == aprId && !i.IsDeleted)
            .Include(i => i.APPItem)
            .Include(i => i.PPMPItem)
            .Include(i => i.APRItemMilestones.Where(m => !m.IsDeleted))
                .ThenInclude(m => m.ProcurementActivityType)
            .ToListAsync(cancellationToken);
    }
}
