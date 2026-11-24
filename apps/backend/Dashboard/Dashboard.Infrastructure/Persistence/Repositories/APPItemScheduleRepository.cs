using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class APPItemScheduleRepository : Repository<APPProcurementSchedule>, IAPPItemScheduleRepository
{
    private readonly ApplicationDbContext context;
    private readonly ISieveProcessor sieveProcessor;

    public APPItemScheduleRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
        this.sieveProcessor = sieveProcessor;
    }

    public async Task<APPProcurementSchedule?> GetWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Set<APPProcurementSchedule>()
            .Where(x => x.Id == id && !x.IsDeleted)
            .Include(x => x.ProcurementActivityType)
            .Include(x => x.PPMPItem)
                .ThenInclude(x => x.APPProcurementSchedules)
                    .ThenInclude(x => x.ProcurementActivityType)
            .Include(x => x.PPMPItem)
                .ThenInclude(x => x.APPItems)
                    .ThenInclude(x => x.APP)
            .Include(x => x.PPMPItem)
                .ThenInclude(x => x.APPItems)
                    .ThenInclude(x => x.Office)
            .Include(x => x.PPMPItem)
                .ThenInclude(x => x.APPItems)
                    .ThenInclude(x => x.ProcurementMode)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<APPProcurementSchedule> Entities, int TotalCount)> GetAllWithDetailsAsync(
        SieveModel sieveModel,
        CancellationToken cancellationToken = default)
    {
        var query = context.Set<APPProcurementSchedule>()
            .AsNoTracking()
            .Where(x => !x.IsDeleted)
            .Include(x => x.ProcurementActivityType)
            .Include(x => x.PPMPItem)
                .ThenInclude(x => x.APPProcurementSchedules)
                    .ThenInclude(x => x.ProcurementActivityType)
            .Include(x => x.PPMPItem)
                .ThenInclude(x => x.APPItems)
                    .ThenInclude(x => x.APP)
            .Include(x => x.PPMPItem)
                .ThenInclude(x => x.APPItems)
                    .ThenInclude(x => x.Office)
            .Include(x => x.PPMPItem)
                .ThenInclude(x => x.APPItems)
                    .ThenInclude(x => x.ProcurementMode)
            .AsQueryable();

        var filteredQuery = sieveProcessor.Apply(sieveModel, query, applyPagination: false);
        var totalCount = await filteredQuery.CountAsync(cancellationToken);
        var entities = await sieveProcessor.Apply(sieveModel, filteredQuery).ToListAsync(cancellationToken);

        return (entities, totalCount);
    }
}
