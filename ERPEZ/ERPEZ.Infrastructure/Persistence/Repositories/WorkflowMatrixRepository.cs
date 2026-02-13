using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Infrastructure.Persistence;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class WorkflowMatrixRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) 
    : Repository<WorkflowMatrix>(context, sieveProcessor), IWorkflowMatrixRepository
{
}
