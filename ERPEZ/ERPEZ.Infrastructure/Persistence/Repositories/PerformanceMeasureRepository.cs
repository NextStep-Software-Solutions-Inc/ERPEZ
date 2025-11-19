using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class PerformanceMeasureRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Domain.Entities.Planning.PerformanceMeasure>(context, sieveProcessor),
      Domain.Interfaces.IPerformanceMeasureRepository
{
}
