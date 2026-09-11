using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class NoticeOfAwardRepository : Repository<NoticeOfAward>, INoticeOfAwardRepository
{
    private readonly ApplicationDbContext context;

    public NoticeOfAwardRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
    }

    public IQueryable<NoticeOfAward> QueryWithDetails()
    {
        return context.NoticeOfAwards!
            .Include(n => n.Supplier)
            .Include(n => n.BACResolution)
            .Include(n => n.ProcurementProject)
                .ThenInclude(p => p.ConsolidatedPR)
            .Include(n => n.ProcurementProject)
                .ThenInclude(p => p.APPItem)
                    .ThenInclude(ai => ai!.APP);
    }
}
