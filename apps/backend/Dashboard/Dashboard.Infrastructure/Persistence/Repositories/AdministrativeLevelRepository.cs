using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class AdministrativeLevelRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Domain.Entities.Planning.AdministrativeLevel>(context, sieveProcessor),
      Domain.Interfaces.IAdministrativeLevelRepository
{
}
