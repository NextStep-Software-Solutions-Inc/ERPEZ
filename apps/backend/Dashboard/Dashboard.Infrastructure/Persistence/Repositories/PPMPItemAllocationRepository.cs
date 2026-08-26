using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class PPMPItemAllocationRepository : Repository<PPMPItemAllocation>, IPPMPItemAllocationRepository
{
    private readonly ApplicationDbContext context;
    private readonly ISieveProcessor sieveProcessor;

    public PPMPItemAllocationRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
        this.sieveProcessor = sieveProcessor;
    }

    private IQueryable<PPMPItemAllocation> BuildDetailedQuery(IQueryable<PPMPItemAllocation>? query = null)
    {
        var baseQuery = query ?? context.Set<PPMPItemAllocation>();

        return baseQuery
            .Include(allocation => allocation.PPMPItem)
                .ThenInclude(item => item.PPMPExpenditureItem)
                    .ThenInclude(expenditure => expenditure.PPMPActivity)
                        .ThenInclude(activity => activity!.PPMP)
                            .ThenInclude(ppmp => ppmp.Office)
            .Include(allocation => allocation.PPMPItem)
                .ThenInclude(item => item.PPMPExpenditureItem)
                    .ThenInclude(expenditure => expenditure.PPMPActivity)
                        .ThenInclude(activity => activity!.PPMP)
                            .ThenInclude(ppmp => ppmp.FiscalYear)
            .Include(allocation => allocation.PPMPItem)
                .ThenInclude(item => item.PPMPExpenditureItem)
                    .ThenInclude(expenditure => expenditure.PPMPActivity)
                        .ThenInclude(activity => activity!.PPMP)
                            .ThenInclude(ppmp => ppmp.FundSource)
            .Include(allocation => allocation.PPMPItem)
                .ThenInclude(item => item.PPMPExpenditureItem)
                    .ThenInclude(expenditure => expenditure.PPMPActivity)
                        .ThenInclude(activity => activity!.PPMP)
                            .ThenInclude(ppmp => ppmp.LineItemBudget)
            .Include(allocation => allocation.PPMPItem)
                .ThenInclude(item => item.ProcurementMode)
            .Include(allocation => allocation.PPMPItem)
                .ThenInclude(item => item.CSEItem)
            .Include(allocation => allocation.PPMPItem)
                .ThenInclude(item => item.NonCSEItem)
                    .ThenInclude(n => n!.UOM)
            .AsSplitQuery();
    }

    public async Task<(IReadOnlyList<PPMPItemAllocation> Entities, int TotalCount)> GetDetailedPagedAsync(SieveModel sieveModel, CancellationToken cancellationToken = default)
    {
        var query = BuildDetailedQuery(context.Set<PPMPItemAllocation>().AsNoTracking().Where(a => !a.IsDeleted));
        var filteredQuery = sieveProcessor.Apply(sieveModel, query, applyPagination: false);
        var totalCount = await filteredQuery.CountAsync(cancellationToken);
        var pagedQuery = sieveProcessor.Apply(sieveModel, filteredQuery, applyFiltering: false, applySorting: false);
        var entities = await pagedQuery.ToListAsync(cancellationToken);
        return (entities, totalCount);
    }

    public async Task<PPMPItemAllocation?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await BuildDetailedQuery(context.Set<PPMPItemAllocation>().AsNoTracking().Where(a => !a.IsDeleted))
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
    }
}
