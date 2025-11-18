using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class KPITargetRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) : Repository<Domain.Entities.Planning.KPITarget>(context, sieveProcessor), Domain.Interfaces.IKPITargetRepository
{
}
