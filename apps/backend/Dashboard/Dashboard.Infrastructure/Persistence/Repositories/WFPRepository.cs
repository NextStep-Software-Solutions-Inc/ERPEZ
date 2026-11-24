using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class WFPRepository : Repository<WFP>, IWFPRepository
{
    private readonly ApplicationDbContext dbContext;

    public WFPRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        dbContext = context;
    }

    public async Task<WFP?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await dbContext.Set<WFP>()
            // ── Office chain (mirrors LIB's BuildAgencyName) ────────────────
            .Include(x => x.Office)
                .ThenInclude(o => o.Organization)
            .Include(x => x.Office)
                .ThenInclude(o => o.Cluster)
            // ── OPCR-mode link ───────────────────────────────────────────────
            .Include(x => x.OPCR!)
            .Include(x => x.FundSource)
            // ── WFPObjective → WFPObjectiveActivity → Timeline / Expenditure ──
            .Include(x => x.WFPObjectives)
                .ThenInclude(o => o.WFPObjectiveActivities)
                    .ThenInclude(a => a.WFPObjectiveTimelines)
            .Include(x => x.WFPObjectives)
                .ThenInclude(o => o.WFPObjectiveActivities)
                    .ThenInclude(a => a.WFPObjectiveActivityExpenditures)
            // ── OPCR-sourced activity link (for activities inherited from OPCR) ──
            .Include(x => x.WFPObjectives)
                .ThenInclude(o => o.WFPObjectiveActivities)
                    .ThenInclude(a => a.OPCRActivity!)
            .AsSplitQuery()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<List<WFPObjectiveActivity>> GetOrphanActivitiesAsync(Guid wfpId, CancellationToken cancellationToken = default)
    {
        // WFP has no direct WFPObjectiveActivities navigation property, so orphan
        // activities (WFPObjectiveId == null) must be queried directly by WFPId,
        // mirroring LineItemBudgetRepository's standalone-detail handling.
        return await dbContext.Set<WFPObjectiveActivity>()
            .Where(a => a.WFPId == wfpId && a.WFPObjectiveId == null)
            .Include(a => a.WFPObjectiveTimelines)
            .Include(a => a.WFPObjectiveActivityExpenditures)
            .Include(a => a.OPCRActivity!)
            .AsSplitQuery()
            .ToListAsync(cancellationToken);
    }
}
