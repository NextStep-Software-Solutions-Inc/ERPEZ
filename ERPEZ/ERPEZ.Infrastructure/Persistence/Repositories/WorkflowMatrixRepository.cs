using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class WorkflowMatrixRepository : Repository<WorkflowMatrix>, IWorkflowMatrixRepository
{
    private readonly ApplicationDbContext dbContext;

    public WorkflowMatrixRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        dbContext = context;
    }

    public async Task<WorkflowMatrix?> GetByIdWithNavigationAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await dbContext.WorkflowMatrices!
            .Include(x => x.FiscalYear)
            .Include(x => x.Office)
            .Include(x => x.RecommendingApproverPosition)
            .Include(x => x.FinalApproverPosition)
            .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted, cancellationToken);
    }

    public IQueryable<WorkflowMatrix> GetAllWithNavigation()
    {
        return dbContext.WorkflowMatrices!
            .AsNoTracking()
            .Include(x => x.FiscalYear)
            .Include(x => x.Office)
            .Include(x => x.RecommendingApproverPosition)
            .Include(x => x.FinalApproverPosition)
            .Where(x => !x.IsDeleted);
    }

    public async Task<(List<WorkflowMatrix> Items, int TotalCount)> GetPagedWithNavigationAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = GetAllWithNavigation();
        
        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }
}
