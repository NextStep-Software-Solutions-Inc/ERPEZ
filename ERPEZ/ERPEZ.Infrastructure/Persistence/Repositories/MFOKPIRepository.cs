using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class MFOKPIRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) 
    : Repository<Domain.Entities.Planning.MFOKPI>(context, sieveProcessor), 
      Domain.Interfaces.IMFOKPIRepository
{
}
