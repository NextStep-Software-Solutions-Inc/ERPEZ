using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class LineItemBudgetRepository : Repository<LineItemBudget>, ILineItemBudgetRepository
{
    private readonly ApplicationDbContext dbContext;
    private readonly ISieveProcessor sieveProcessor;

    public LineItemBudgetRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        dbContext = context;
        this.sieveProcessor = sieveProcessor;
    }

    public async Task<LineItemBudget?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await dbContext.LineItemBudgets!
            .Include(x => x.FiscalYearEntity)
            .Include(x => x.FundSource)
            .Include(x => x.Office)
                .ThenInclude(o => o!.Organization)
            .Include(x => x.Office)
                .ThenInclude(o => o!.Cluster)
            .Include(x => x.ParentLIB)
            .Include(x => x.ConsolidatedIntoLIB)
            .Include(x => x.PreviousVersion)
            // ── Activities: WFP chain ─────────────────────────────────────
            .Include(x => x.LineItemBudgetActivities)
                .ThenInclude(a => a.WFPObjectiveActivity)
                    .ThenInclude(wa => wa!.WFPObjective!)
                        .ThenInclude(wo => wo!.WFP!)
            // ── Activities: OPCR → KPI chain ──────────────────────────────
            .Include(x => x.LineItemBudgetActivities)
                .ThenInclude(a => a.OPCRActivity)
                    .ThenInclude(oa => oa!.OPCRItem!)
                        .ThenInclude(oi => oi!.KPIAssignment!)
                            .ThenInclude(ka => ka!.FYActiveKPI!)
                                .ThenInclude(fy => fy!.MFOPAP!)
            // ── Activity details: Object tree (4 levels deep) ─────────────
            .Include(x => x.LineItemBudgetActivities)
                .ThenInclude(a => a.LineItemBudgetDetails)
                    .ThenInclude(d => d.Object)
                        .ThenInclude(o => o.ParentObject!)
                            .ThenInclude(p1 => p1.ParentObject!)
                                .ThenInclude(p2 => p2.ParentObject!)
                                    .ThenInclude(p3 => p3.ParentObject!)
            .Include(x => x.LineItemBudgetActivities)
                .ThenInclude(a => a.LineItemBudgetDetails)
                    .ThenInclude(d => d.WFPObjectiveActivityExpenditure)
            // ── Standalone details: Object tree (4 levels deep) ───────────
            .Include(x => x.LineItemBudgetDetails)
                .ThenInclude(d => d.Object)
                    .ThenInclude(o => o.ParentObject!)
                        .ThenInclude(p1 => p1.ParentObject!)
                            .ThenInclude(p2 => p2.ParentObject!)
                                .ThenInclude(p3 => p3.ParentObject!)
            .Include(x => x.LineItemBudgetDetails)
                .ThenInclude(d => d.WFPObjectiveActivityExpenditure)
            .AsSplitQuery()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<List<LineItemBudget>> GetAllWithDetailsAsync(bool includeDeleted = false, CancellationToken cancellationToken = default)
    {
        var query = dbContext.LineItemBudgets!
            .Include(x => x.FiscalYearEntity)
            .Include(x => x.FundSource)
            .Include(x => x.Office)
            .Include(x => x.ParentLIB)
            .Include(x => x.ConsolidatedIntoLIB)
            .Include(x => x.PreviousVersion)
            .Include(x => x.LineItemBudgetActivities)
            .Include(x => x.LineItemBudgetDetails)
            .AsQueryable();

        if (!includeDeleted)
        {
            query = query.Where(x => !x.IsDeleted);
        }

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<(IEnumerable<LineItemBudget>, int)> GetAllWithDetailsAsync(SieveModel sieveModel, CancellationToken cancellationToken = default)
    {
        var query = dbContext.LineItemBudgets!
            .Include(x => x.FiscalYearEntity)
            .Include(x => x.FundSource)
            .Include(x => x.Office)
            .Include(x => x.ParentLIB)
            .Include(x => x.ConsolidatedIntoLIB)
            .Include(x => x.PreviousVersion)
            .Include(x => x.LineItemBudgetActivities)
            .Include(x => x.LineItemBudgetDetails)
            .Where(x => !x.IsDeleted)
            .AsSplitQuery()
            .AsNoTracking()
            .AsQueryable();

        var filteredQuery = sieveProcessor.Apply(sieveModel, query, applyPagination: false);
        var filteredCount = await filteredQuery.CountAsync(cancellationToken);
        var paginatedQuery = sieveProcessor.Apply(sieveModel, filteredQuery, applyFiltering: false, applySorting: false);
        var results = await paginatedQuery.ToListAsync(cancellationToken);

        return (results, filteredCount);
    }
}
