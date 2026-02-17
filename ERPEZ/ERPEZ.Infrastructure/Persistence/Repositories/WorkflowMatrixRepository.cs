using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class WorkflowMatrixRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) 
    : Repository<WorkflowMatrix>(context, sieveProcessor), IWorkflowMatrixRepository
{
    public async Task<WorkflowMatrix?> GetByIdWithNavigationAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.WorkflowMatrices!
            .Include(x => x.FiscalYear)
            .Include(x => x.Organization)
            .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted, cancellationToken);
    }
}
