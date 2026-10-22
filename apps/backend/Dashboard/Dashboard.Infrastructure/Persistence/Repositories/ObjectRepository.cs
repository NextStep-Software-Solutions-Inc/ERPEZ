using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class ObjectRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Domain.Entities.Planning.Object>(context, sieveProcessor),
      Domain.Interfaces.IObjectRepository
{
}
