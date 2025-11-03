using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class WFPObjectiveRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) 
    : Repository<Domain.Entities.Planning.WFPObjective>(context, sieveProcessor), 
      Domain.Interfaces.IWFPObjectiveRepository
{
}
