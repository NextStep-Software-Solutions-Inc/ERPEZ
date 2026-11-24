using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class ProcurementModeThresholdRepository : Repository<Domain.Entities.Planning.ProcurementModeThreshold>, Domain.Interfaces.IProcurementModeThresholdRepository
{
    private readonly ApplicationDbContext dbContext;

    public ProcurementModeThresholdRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        dbContext = context;
    }

    public async Task<Domain.Entities.Planning.ProcurementModeThreshold?> GetByIdWithNavigationAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await dbContext.ProcurementModeThresholds!
            .Include(x => x.ProcurementMode)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<bool> HasOverlappingDateRangeAsync(Guid procurementModeId, DateTime effectivityStart, DateTime? effectivityEnd, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = dbContext.ProcurementModeThresholds!
            .Where(x => x.ProcurementModeId == procurementModeId &&
                       ((effectivityStart >= x.EffectivityStart && effectivityStart <= (x.EffectivityEnd ?? DateTime.MaxValue)) ||
                        ((effectivityEnd ?? DateTime.MaxValue) >= x.EffectivityStart && (effectivityEnd ?? DateTime.MaxValue) <= (x.EffectivityEnd ?? DateTime.MaxValue)) ||
                        (effectivityStart <= x.EffectivityStart && (effectivityEnd ?? DateTime.MaxValue) >= (x.EffectivityEnd ?? DateTime.MaxValue))));

        if (excludeId.HasValue)
        {
            query = query.Where(x => x.Id != excludeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<bool> HasReferencesByProcurementModeAsync(Guid procurementModeId, CancellationToken cancellationToken = default)
    {
        return await dbContext.ProcurementModeThresholds!
            .AnyAsync(pmt => pmt.ProcurementModeId == procurementModeId, cancellationToken);
    }
}
