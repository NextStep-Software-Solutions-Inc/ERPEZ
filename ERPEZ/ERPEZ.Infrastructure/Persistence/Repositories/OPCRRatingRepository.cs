using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class OPCRRatingRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) 
    : Repository<Domain.Entities.Planning.OPCRRating>(context, sieveProcessor), 
      Domain.Interfaces.IOPCRRatingRepository
{
}
