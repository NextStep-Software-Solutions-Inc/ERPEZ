using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class LineItemBudgetRepository : Repository<LineItemBudget>, ILineItemBudgetRepository
{
    private readonly ApplicationDbContext dbContext;

    public LineItemBudgetRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        dbContext = context;
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
            .Include(x => x.LineItemBudgetDetails)
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
}