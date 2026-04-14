using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class LineItemBudgetDetailRepository : Repository<LineItemBudgetDetail>, ILineItemBudgetDetailRepository
{
    private readonly ApplicationDbContext dbContext;

    public LineItemBudgetDetailRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        dbContext = context;
    }

    public async Task<LineItemBudgetDetail?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await dbContext.LineItemBudgetDetails!
            .Include(x => x.LineItemBudget)
            .Include(x => x.LineItemBudgetActivity)
            .Include(x => x.WFPObjectiveActivityExpenditure)
            .Include(x => x.Object)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<List<LineItemBudgetDetail>> GetAllWithDetailsAsync(bool includeDeleted = false, CancellationToken cancellationToken = default)
    {
        var query = dbContext.LineItemBudgetDetails!
            .Include(x => x.LineItemBudget)
            .Include(x => x.LineItemBudgetActivity)
            .Include(x => x.WFPObjectiveActivityExpenditure)
            .Include(x => x.Object)
            .AsQueryable();

        if (!includeDeleted)
        {
            query = query.Where(x => !x.IsDeleted);
        }

        return await query.ToListAsync(cancellationToken);
    }
}