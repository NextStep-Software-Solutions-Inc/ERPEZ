using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class PPMPItemRepository : Repository<PPMPItem>, IPPMPItemRepository
{
    private readonly ApplicationDbContext context;
    private readonly ISieveProcessor sieveProcessor;

    public PPMPItemRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
        this.sieveProcessor = sieveProcessor;
    }

    public async Task<List<PPMPItem>> GetItemsWithAllocationsAsync(Guid ppmpId, CancellationToken cancellationToken = default)
    {
        return await context.Set<PPMPItem>()
            .Include(pi => pi.PPMPItemAllocations)
            .Include(pi => pi.CSEItem)
            .Include(pi => pi.NonCSEItem)
            .Include(pi => pi.ProcurementMode)
            .Where(pi => pi.PPMPId == ppmpId && !pi.IsDeleted)
            .AsSplitQuery()
            .ToListAsync(cancellationToken);
    }

    public async Task<List<PPMPItem>> GetItemsByExpenditureItemIdAsync(Guid expenditureItemId, CancellationToken cancellationToken = default)
    {
        return await context.Set<PPMPItem>()
            .Include(pi => pi.PPMPItemAllocations)
            .Where(pi => pi.PPMPExpenditureItemId == expenditureItemId && !pi.IsDeleted)
            .ToListAsync(cancellationToken);
    }
}
