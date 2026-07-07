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
    /// Fetches a single ConsolidatedPRItem with the full navigation chain needed to resolve
    /// RFQItem snapshot fields (UnitPriceSnapshot, ItemNameSnapshot, CategorySnapshot, FundSnapshot)
    /// and the RFQ mode-lock / GPPB threshold checks (ProcurementMode).
    /// </summary>
    public async Task<ConsolidatedPRItem?> GetByIdWithDetailsAsync(
        Guid id, CancellationToken cancellationToken = default)
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
            .Where(ci => !ci.IsDeleted)
            .FirstOrDefaultAsync(ci => ci.Id == id, cancellationToken);
    }
}
