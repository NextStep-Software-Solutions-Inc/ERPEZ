using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class WFPOutcomeRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Domain.Entities.Planning.WFPOutcome>(context, sieveProcessor),
      Domain.Interfaces.IWFPOutcomeRepository
{
}
