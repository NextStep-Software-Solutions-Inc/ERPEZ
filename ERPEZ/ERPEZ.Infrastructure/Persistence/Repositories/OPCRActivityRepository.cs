using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class OPCRActivityRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) 
    : Repository<Domain.Entities.Planning.OPCRActivity>(context, sieveProcessor), 
      Domain.Interfaces.IOPCRActivityRepository
{
}
