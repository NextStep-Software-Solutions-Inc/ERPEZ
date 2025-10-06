using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class LocationRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) 
    : Repository<Domain.Entities.Planning.Location>(context, sieveProcessor), 
      Domain.Interfaces.ILocationRepository
{
}
