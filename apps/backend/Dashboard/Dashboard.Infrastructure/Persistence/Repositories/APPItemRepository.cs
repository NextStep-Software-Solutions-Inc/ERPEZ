using System.Linq.Expressions;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class APPItemRepository : Repository<APPItem>, IAPPItemRepository
{
    private readonly ApplicationDbContext context;
    private readonly ISieveProcessor sieveProcessor;

    public APPItemRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
        this.sieveProcessor = sieveProcessor;
    }

    public async Task<List<APPItem>> GetAPPItemsWithDetailsAsync(
        Guid appId,
        CancellationToken cancellationToken = default)
    {
        return await BuildDetailedQuery(context.Set<APPItem>().Where(a => a.APPId == appId && !a.IsDeleted))
            .ToListAsync(cancellationToken);
    }

    public async Task<List<APPItem>> GetAPPItemsByPPMPIdsAsync(Guid appId, IEnumerable<Guid> ppmpIds, CancellationToken cancellationToken = default)
    {
        var ppmpIdList = ppmpIds.ToList();
        return await context.Set<APPItem>()
            .IgnoreQueryFilters()
            .Where(a => a.APPId == appId && 
                        a.PPMPItem != null && 
                        a.PPMPItem.PPMPExpenditureItem != null &&
                        a.PPMPItem.PPMPExpenditureItem.PPMPActivity != null && 
                        ppmpIdList.Contains(a.PPMPItem.PPMPExpenditureItem.PPMPActivity.PPMPId))
            .ToListAsync(cancellationToken);
    }

    public async Task<APPItem?> GetWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await BuildDetailedQuery(context.Set<APPItem>().Where(a => a.Id == id && !a.IsDeleted))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<List<APPItem>> FindAllWithDetailsAsync(
        Expression<Func<APPItem, bool>> predicate,
        CancellationToken cancellationToken = default)
    {
        return await BuildDetailedQuery(context.Set<APPItem>().Where(predicate))
            .AsSplitQuery()
            .ToListAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<APPItem> Entities, int TotalCount)> GetAllWithDetailsAsync(
        SieveModel sieveModel,
        CancellationToken cancellationToken = default)
    {
        var query = context.Set<APPItem>().Where(a => !a.IsDeleted);

        var detailedQuery = BuildDetailedQuery(query);
        var filteredQuery = sieveProcessor.Apply(sieveModel, detailedQuery, applyPagination: false);
        var totalCount = await filteredQuery.CountAsync(cancellationToken);
        var entities = await sieveProcessor.Apply(sieveModel, filteredQuery)
            .ToListAsync(cancellationToken);

        return (entities, totalCount);
    }

    private IQueryable<APPItem> BuildDetailedQuery(IQueryable<APPItem> query)
    {
        return query
            .Include(a => a.APP)
            .Include(a => a.ProcurementMode)
            .Include(a => a.FundSource)
            .Include(a => a.Office)
            .Include(a => a.PPMPItem)
                .ThenInclude(pi => pi.PPMPItemAllocations)
            .Include(a => a.PPMPItem)
                .ThenInclude(pi => pi.ProcurementMode)
            .Include(a => a.PPMPItem)
                .ThenInclude(pi => pi.APPProcurementSchedules)
                    .ThenInclude(s => s.ProcurementActivityType)
            .Include(a => a.PPMPItem)
                .ThenInclude(pi => pi.PPMPExpenditureItem)
                    .ThenInclude(pei => pei.PPMPActivity)
                        .ThenInclude(pa => pa!.LIBActivity)
                            .ThenInclude(la => la.LineItemBudgetDetails)
                                .ThenInclude(ld => ld.Object)
                                    .ThenInclude(o => o.ObjectExpenseClasses)
                                        .ThenInclude(oec => oec.ExpenseClass)
            .AsSplitQuery();
    }
}
