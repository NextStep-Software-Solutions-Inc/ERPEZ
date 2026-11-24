using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class RatingScaleLevelRepository : Repository<Domain.Entities.Planning.RatingScaleLevel>, IRatingScaleLevelRepository
{
    public RatingScaleLevelRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
    }
}
