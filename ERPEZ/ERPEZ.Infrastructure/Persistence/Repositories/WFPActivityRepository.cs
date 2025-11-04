using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class WFPActivityRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) 
    : Repository<Domain.Entities.Planning.WFPActivity>(context, sieveProcessor), 
      Domain.Interfaces.IWFPActivityRepository
{
}
