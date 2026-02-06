using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class PositionRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Domain.Entities.Planning.Position>(context, sieveProcessor),
      Domain.Interfaces.IPositionRepository
{
}
