using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class DeliveryUnitRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) 
    : Repository<Domain.Entities.Planning.DeliveryUnit>(context, sieveProcessor), 
      Domain.Interfaces.IDeliveryUnitRepository
{
}
