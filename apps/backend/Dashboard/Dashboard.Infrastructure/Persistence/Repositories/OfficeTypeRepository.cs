using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class OfficeTypeRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Domain.Entities.Planning.OfficeType>(context, sieveProcessor),
      Domain.Interfaces.IOfficeTypeRepository
{
}
