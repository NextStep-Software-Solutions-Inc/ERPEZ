using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Infrastructure.Persistence;
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
            .Include(x => x.FiscalYear)
            .Include(x => x.Office)
            .Include(x => x.RecommendingApproverPosition)
            .Include(x => x.FinalApproverPosition)
            .Where(x => !x.IsDeleted);
    }
}
