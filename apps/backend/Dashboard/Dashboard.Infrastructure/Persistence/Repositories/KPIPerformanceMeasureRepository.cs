using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class KPIPerformanceMeasureRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Domain.Entities.Planning.KPIPerformanceMeasure>(context, sieveProcessor),
      Domain.Interfaces.IKPIPerformanceMeasureRepository
{
}
