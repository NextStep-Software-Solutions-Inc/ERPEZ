using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class WFPObjectiveActivityRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Domain.Entities.Planning.WFPObjectiveActivity>(context, sieveProcessor),
      Domain.Interfaces.IWFPObjectiveActivityRepository
{
}
