using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class ReceivedFundRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Domain.Entities.Planning.ReceivedFund>(context, sieveProcessor),
      Domain.Interfaces.IReceivedFundRepository
{
}
