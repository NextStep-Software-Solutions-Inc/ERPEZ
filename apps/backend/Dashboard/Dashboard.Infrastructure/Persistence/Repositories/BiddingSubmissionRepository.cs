using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class BiddingSubmissionRepository : Repository<BiddingSubmission>, IBiddingSubmissionRepository
{
    public BiddingSubmissionRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
    }
}
