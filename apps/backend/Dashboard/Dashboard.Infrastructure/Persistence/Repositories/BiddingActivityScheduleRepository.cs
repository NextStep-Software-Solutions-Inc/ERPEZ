using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class BiddingActivityScheduleRepository : Repository<BiddingActivitySchedule>, IBiddingActivityScheduleRepository
{
    public BiddingActivityScheduleRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
    }
}
