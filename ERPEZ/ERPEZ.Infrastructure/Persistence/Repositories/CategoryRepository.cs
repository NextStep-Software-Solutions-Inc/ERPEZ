using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class CategoryRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Domain.Entities.Planning.Category>(context, sieveProcessor),
      Domain.Interfaces.ICategoryRepository
{
}
