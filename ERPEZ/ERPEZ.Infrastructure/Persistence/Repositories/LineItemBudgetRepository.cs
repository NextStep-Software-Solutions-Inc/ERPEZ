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
            .Include(x => x.FundCluster)
            .Include(x => x.Office)
            .Include(x => x.DeliveryUnit)
            .Include(x => x.ParentLIB)
            .Include(x => x.ConsolidatedIntoLIB)
            .Include(x => x.PreviousVersion)
            .Include(x => x.LineItemBudgetActivities)
                .ThenInclude(a => a.WFPObjectiveActivity)
            .Include(x => x.LineItemBudgetActivities)
                .ThenInclude(a => a.OPCRActivity)
            .Include(x => x.LineItemBudgetActivities)
                .ThenInclude(a => a.LineItemBudgetDetails)
                    .ThenInclude(d => d.Object)
                        .ThenInclude(o => o.ObjectExpenseClasses)
                            .ThenInclude(oc => oc.ExpenseClass)
            .Include(x => x.LineItemBudgetActivities)
                .ThenInclude(a => a.LineItemBudgetDetails)
                    .ThenInclude(d => d.WFPObjectiveActivityExpenditure)
            .Include(x => x.LineItemBudgetActivities)
                .ThenInclude(a => a.LineItemBudgetDetails)
                    .ThenInclude(d => d.BudgetAllocations)
            .Include(x => x.LineItemBudgetDetails)
                .ThenInclude(d => d.Object)
                    .ThenInclude(o => o.ObjectExpenseClasses)
                        .ThenInclude(oc => oc.ExpenseClass)
            .Include(x => x.LineItemBudgetDetails)
                .ThenInclude(d => d.WFPObjectiveActivityExpenditure)
            .Include(x => x.LineItemBudgetDetails)
                .ThenInclude(d => d.BudgetAllocations)
            .AsSplitQuery()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<List<LineItemBudget>> GetAllWithDetailsAsync(bool includeDeleted = false, CancellationToken cancellationToken = default)
    {
        var query = dbContext.LineItemBudgets!
            .Include(x => x.FiscalYearEntity)
            .Include(x => x.FundCluster)
            .Include(x => x.Office)
            .Include(x => x.DeliveryUnit)
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
            .Include(x => x.FundCluster)
            .Include(x => x.Office)
            .Include(x => x.DeliveryUnit)
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