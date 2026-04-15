using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class LineItemBudgetDetailRepository : Repository<LineItemBudgetDetail>, ILineItemBudgetDetailRepository
{
    private readonly ApplicationDbContext dbContext;
    private readonly ISieveProcessor sieveProcessor;

    public LineItemBudgetDetailRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        dbContext = context;
        this.sieveProcessor = sieveProcessor;
    }

    public async Task<LineItemBudgetDetail?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await dbContext.LineItemBudgetDetails!
            .Include(x => x.LineItemBudget)
            .Include(x => x.LineItemBudgetActivity)
            .Include(x => x.WFPObjectiveActivityExpenditure)
            .Include(x => x.Object)
                .ThenInclude(o => o.ObjectExpenseClasses)
                    .ThenInclude(oc => oc.ExpenseClass)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<List<LineItemBudgetDetail>> GetAllWithDetailsAsync(bool includeDeleted = false, CancellationToken cancellationToken = default)
    {
        var query = dbContext.LineItemBudgetDetails!
            .Include(x => x.LineItemBudget)
            .Include(x => x.LineItemBudgetActivity)
            .Include(x => x.WFPObjectiveActivityExpenditure)
            .Include(x => x.Object)
                .ThenInclude(o => o.ObjectExpenseClasses)
                    .ThenInclude(oc => oc.ExpenseClass)
            .AsQueryable();

        if (!includeDeleted)
        {
            query = query.Where(x => !x.IsDeleted);
        }

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<(IEnumerable<LineItemBudgetDetail>, int)> GetAllWithDetailsAsync(SieveModel sieveModel, CancellationToken cancellationToken = default)
    {
        var query = dbContext.LineItemBudgetDetails!
            .Include(x => x.LineItemBudget)
            .Include(x => x.LineItemBudgetActivity)
            .Include(x => x.WFPObjectiveActivityExpenditure)
            .Include(x => x.Object)
                .ThenInclude(o => o.ObjectExpenseClasses)
                    .ThenInclude(oc => oc.ExpenseClass)
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