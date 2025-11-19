using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class KPIRatingRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Domain.Entities.Planning.KPIRating>(context, sieveProcessor),
      Domain.Interfaces.IKPIRatingRepository
{
}
