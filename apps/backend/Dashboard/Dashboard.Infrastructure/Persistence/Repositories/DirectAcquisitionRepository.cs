using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class DirectAcquisitionRepository : Repository<DirectAcquisition>, IDirectAcquisitionRepository
{
    private readonly ApplicationDbContext context;

    public DirectAcquisitionRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
    }

    public async Task<DirectAcquisition?> GetByIdWithItemsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Set<DirectAcquisition>()
            .Include(d => d.ConsolidatedPR)
                .ThenInclude(cpr => cpr.ConsolidatedPRItems)
                    .ThenInclude(ci => ci.PRItem)
                        .ThenInclude(pri => pri.PPMPItem)
            .FirstOrDefaultAsync(d => d.Id == id && !d.IsDeleted, cancellationToken);
    }

    public async Task<DirectAcquisition?> GetByIdWithConsolidatedPRAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Set<DirectAcquisition>()
            .Include(d => d.ConsolidatedPR)
            .FirstOrDefaultAsync(d => d.Id == id && !d.IsDeleted, cancellationToken);
    }

    public async Task<List<DirectAcquisition>> GetApprovedAvailableForPOAsync(IEnumerable<Guid> excludedIds, CancellationToken cancellationToken = default)
    {
        var excludedList = excludedIds.ToList();
        return await context.Set<DirectAcquisition>()
            .Include(d => d.ConsolidatedPR)
                .ThenInclude(cpr => cpr.ConsolidatedPRItems)
                    .ThenInclude(ci => ci.PRItem)
                        .ThenInclude(pri => pri.PPMPItem)
            .Include(d => d.ConsolidatedPR)
                .ThenInclude(cpr => cpr.ConsolidatedPRItems)
                    .ThenInclude(ci => ci.PurchaseRequest)
                        .ThenInclude(pr => pr.Office)
            .Include(d => d.ConsolidatedPR)
                .ThenInclude(cpr => cpr.ConsolidatedPRItems)
                    .ThenInclude(ci => ci.PurchaseRequest)
                        .ThenInclude(pr => pr.FundSource)
            .Include(d => d.BACProject)
                .ThenInclude(p => p!.BACResolutions)
            .Where(d => d.Status == ERPEZ.Domain.Enums.DirectAcquisitionStatusEnum.APPROVED && !excludedList.Contains(d.Id) && !d.IsDeleted)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync(cancellationToken);
    }
}
