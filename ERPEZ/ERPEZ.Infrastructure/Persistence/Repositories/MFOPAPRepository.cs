using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class MFOPAPRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) : Repository<Domain.Entities.Planning.MFOPAP>(context, sieveProcessor), Domain.Interfaces.IMFOPAPRepository
{
}
