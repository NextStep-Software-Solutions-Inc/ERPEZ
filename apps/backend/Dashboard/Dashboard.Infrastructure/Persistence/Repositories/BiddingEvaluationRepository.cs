using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class BiddingEvaluationRepository : Repository<BiddingEvaluation>, IBiddingEvaluationRepository
{
    public BiddingEvaluationRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
    }
}
