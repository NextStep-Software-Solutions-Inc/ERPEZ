using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class KPIRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Domain.Entities.Planning.KPI>(context, sieveProcessor),
      Domain.Interfaces.IKPIRepository
{
}
