using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class PositionTypeRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Domain.Entities.Planning.PositionType>(context, sieveProcessor),
      Domain.Interfaces.IPositionTypeRepository
{
}
