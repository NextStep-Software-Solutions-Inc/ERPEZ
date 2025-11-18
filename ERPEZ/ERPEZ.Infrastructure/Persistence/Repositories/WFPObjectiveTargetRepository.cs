using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class WFPObjectiveTargetRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Domain.Entities.Planning.WFPObjectiveTarget>(context, sieveProcessor),
      Domain.Interfaces.IWFPObjectiveTargetRepository
{
}
