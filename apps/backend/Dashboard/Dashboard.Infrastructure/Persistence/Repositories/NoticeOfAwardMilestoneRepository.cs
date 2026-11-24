using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class NoticeOfAwardMilestoneRepository : Repository<NoticeOfAwardMilestone>, INoticeOfAwardMilestoneRepository
{
    public NoticeOfAwardMilestoneRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
    }
}
