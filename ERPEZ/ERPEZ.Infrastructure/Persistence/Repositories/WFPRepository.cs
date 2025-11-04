using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class WFPRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) 
    : Repository<Domain.Entities.Planning.WFP>(context, sieveProcessor), 
      Domain.Interfaces.IWFPRepository
{
}
