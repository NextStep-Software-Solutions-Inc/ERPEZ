using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class OfficeRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Domain.Entities.Planning.Office>(context, sieveProcessor),
      Domain.Interfaces.IOfficeRepository
{
}
