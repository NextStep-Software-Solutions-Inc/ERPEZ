using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class PlantillaTypeRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Domain.Entities.Planning.PlantillaType>(context, sieveProcessor),
      Domain.Interfaces.IPlantillaTypeRepository
{
}
