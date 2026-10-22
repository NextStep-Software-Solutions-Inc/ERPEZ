using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class ConsolidatedPRItemRepository : Repository<ConsolidatedPRItem>, IConsolidatedPRItemRepository
{
    private readonly ApplicationDbContext context;

    public ConsolidatedPRItemRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
    }

    /// <summary>
    /// Batched version of <see cref="GetByIdWithDetailsAsync"/> — same navigation chain,
    /// used to avoid N+1 queries when resolving multiple ConsolidatedPRItems at once
    /// (e.g. AddRFQItemsCommandHandler).
    /// </summary>
    public async Task<List<ConsolidatedPRItem>> GetByIdsWithDetailsAsync(
        IEnumerable<Guid> ids, CancellationToken cancellationToken = default)
    {
        return await context.Set<ConsolidatedPRItem>()
            .Include(ci => ci.PRItem)
                .ThenInclude(i => i.PurchaseRequest)
                    .ThenInclude(pr => pr.ProcurementCategory)
            .Include(ci => ci.PRItem)
                .ThenInclude(i => i.PurchaseRequest)
                    .ThenInclude(pr => pr.FundSource)
            .Include(ci => ci.PRItem)
                .ThenInclude(i => i.PPMPItem)
                    .ThenInclude(pi => pi!.ProcurementMode)
                        .ThenInclude(pm => pm!.ProcurementCategory)
            .Include(ci => ci.ProcurementMode)
            .AsSplitQuery()
            .Where(ci => !ci.IsDeleted && ids.Contains(ci.Id))
            .ToListAsync(cancellationToken);
    }
}
