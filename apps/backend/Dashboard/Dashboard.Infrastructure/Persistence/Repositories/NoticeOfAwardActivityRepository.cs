using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class NoticeOfAwardActivityRepository : Repository<NoticeOfAwardActivity>, INoticeOfAwardActivityRepository
{
    public NoticeOfAwardActivityRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
    }
}
