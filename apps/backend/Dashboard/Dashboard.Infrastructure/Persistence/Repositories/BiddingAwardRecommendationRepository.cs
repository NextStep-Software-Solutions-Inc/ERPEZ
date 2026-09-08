using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class BiddingAwardRecommendationRepository : Repository<BiddingAwardRecommendation>, IBiddingAwardRecommendationRepository
{
    public BiddingAwardRecommendationRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
    }
}
