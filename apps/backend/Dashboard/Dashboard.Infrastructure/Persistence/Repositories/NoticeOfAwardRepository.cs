using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class NoticeOfAwardRepository : Repository<NoticeOfAward>, INoticeOfAwardRepository
{
    public NoticeOfAwardRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
    }
}
