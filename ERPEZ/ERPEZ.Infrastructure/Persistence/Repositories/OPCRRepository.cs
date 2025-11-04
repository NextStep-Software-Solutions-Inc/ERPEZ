using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class OPCRRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) 
    : Repository<Domain.Entities.Planning.OPCR>(context, sieveProcessor), 
      Domain.Interfaces.IOPCRRepository
{
}
