using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class ProcurementWorkflowRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Domain.Entities.Planning.ProcurementWorkflow>(context, sieveProcessor),
      Domain.Interfaces.IProcurementWorkflowRepository
{
}
