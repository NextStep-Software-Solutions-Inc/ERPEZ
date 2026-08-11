using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;
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

    private IQueryable<PPMPItem> BuildDetailedQuery(IQueryable<PPMPItem>? query = null)
    {
        var baseQuery = query ?? context.Set<PPMPItem>();

        return baseQuery
            .Include(item => item.PPMPExpenditureItem)
                .ThenInclude(expenditure => expenditure.PPMPActivity)
                    .ThenInclude(activity => activity.PPMP)
                        .ThenInclude(ppmp => ppmp.Office)
            .Include(item => item.PPMPExpenditureItem)
                .ThenInclude(expenditure => expenditure.PPMPActivity)
                    .ThenInclude(activity => activity.PPMP)
                        .ThenInclude(ppmp => ppmp.FiscalYear)
            .Include(item => item.PPMPExpenditureItem)
                .ThenInclude(expenditure => expenditure.PPMPActivity)
                    .ThenInclude(activity => activity.PPMP)
                        .ThenInclude(ppmp => ppmp.FundSource)
            .Include(item => item.PPMPExpenditureItem)
                .ThenInclude(expenditure => expenditure.PPMPActivity)
                    .ThenInclude(activity => activity.PPMP)
                        .ThenInclude(ppmp => ppmp.LineItemBudget)
            .Include(item => item.PPMPItemAllocations)
            .Include(item => item.ProcurementMode)
            .Include(item => item.CSEItem)
            .Include(item => item.NonCSEItem)
                .ThenInclude(n => n!.UOM)
            .AsSplitQuery();
    }

    public async Task<List<PPMPItem>> GetItemsWithAllocationsAsync(Guid ppmpId, CancellationToken cancellationToken = default)
    {
        return await context.Set<PPMPItem>()
            .Include(pi => pi.PPMPItemAllocations)
            .Include(pi => pi.CSEItem)
            .Include(pi => pi.NonCSEItem)
            .Include(pi => pi.ProcurementMode)
            .Where(pi => !pi.IsDeleted
                && pi.PPMPExpenditureItem != null
                && pi.PPMPExpenditureItem.PPMPActivity != null
                && pi.PPMPExpenditureItem.PPMPActivity.PPMPId == ppmpId)
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

    public async Task<List<PPMPItem>> GetItemsByPpmpIdsAsync(List<Guid> ppmpIds, CancellationToken cancellationToken = default)
    {
        if (ppmpIds == null || ppmpIds.Count == 0)
            return [];

        var query = BuildDetailedQuery(context.Set<PPMPItem>().AsNoTracking().Where(item =>
            !item.IsDeleted &&
            item.PPMPExpenditureItem != null &&
            item.PPMPExpenditureItem.PPMPActivity != null &&
            ppmpIds.Contains(item.PPMPExpenditureItem.PPMPActivity.PPMPId)));

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<PPMPItem> Entities, int TotalCount)> GetDetailedPagedAsync(SieveModel sieveModel, CancellationToken cancellationToken = default)
    {
        var query = BuildDetailedQuery(context.Set<PPMPItem>().AsNoTracking().Where(item => !item.IsDeleted));
        var filteredQuery = sieveProcessor.Apply(sieveModel, query, applyPagination: false);
        var totalCount = await filteredQuery.CountAsync(cancellationToken);
        var pagedQuery = sieveProcessor.Apply(sieveModel, filteredQuery, applyFiltering: false, applySorting: false);
        var entities = await pagedQuery.ToListAsync(cancellationToken);
        return (entities, totalCount);
    }

    public async Task<PPMPItem?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await BuildDetailedQuery(context.Set<PPMPItem>().AsNoTracking().Where(item => !item.IsDeleted))
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
    }
}
