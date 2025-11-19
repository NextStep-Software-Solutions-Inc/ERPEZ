using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class OPCRKPIRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Domain.Entities.Planning.OPCRKPI>(context, sieveProcessor),
      Domain.Interfaces.IOPCRKPIRepository
{
}
