using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class LineItemBudgetActivityRepository : Repository<LineItemBudgetActivity>, ILineItemBudgetActivityRepository
{
    private readonly ApplicationDbContext dbContext;

    public LineItemBudgetActivityRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        dbContext = context;
    }

    public async Task<LineItemBudgetActivity?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await dbContext.LineItemBudgetActivities!
            .Include(x => x.LineItemBudget)
            .Include(x => x.WFPObjectiveActivity)
            .Include(x => x.OPCRActivity)
            .Include(x => x.LineItemBudgetDetails)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<List<LineItemBudgetActivity>> GetAllWithDetailsAsync(bool includeDeleted = false, CancellationToken cancellationToken = default)
    {
        var query = dbContext.LineItemBudgetActivities!
            .Include(x => x.LineItemBudget)
            .Include(x => x.WFPObjectiveActivity)
            .Include(x => x.OPCRActivity)
            .Include(x => x.LineItemBudgetDetails)
            .AsQueryable();

        if (!includeDeleted)
        {
            query = query.Where(x => !x.IsDeleted);
        }

        return await query.ToListAsync(cancellationToken);
    }
}