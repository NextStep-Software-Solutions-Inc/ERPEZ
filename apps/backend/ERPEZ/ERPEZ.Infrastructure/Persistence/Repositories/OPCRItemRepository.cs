using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class OPCRItemRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Domain.Entities.Planning.OPCRItem>(context, sieveProcessor),
      Domain.Interfaces.IOPCRItemRepository
{
}
