using Sieve.Services;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class OPCRConsolidationRepository : Repository<OPCRConsolidation>, IOPCRConsolidationRepository
{
    // 1. Remove the underscore
    private readonly ApplicationDbContext context;

    public OPCRConsolidationRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) 
        : base(context, sieveProcessor)
    {
        // 2. Use 'this' to assign the parameter to the field
        this.context = context;
    }

    public async Task<OPCRConsolidation?> GetConsolidationWithOPCRsAsync(
        Guid id, CancellationToken cancellationToken = default)
    {
        // 3. Use standard 'context' here
        return await context.Set<OPCRConsolidation>()
            .Where(c => c.Id == id && !c.IsDeleted)
            // Fiscal Year
            .Include(c => c.FiscalYear)
            // OPCRs → Office → Organization (for agency name)
            .Include(c => c.OPCRs.Where(o => !o.IsDeleted))
                .ThenInclude(o => o.Office)
                    .ThenInclude(of => of.Organization)
            // OPCRs → Items → KPIAssignment → FYActiveKPI → MFOPAP (direct)
            .Include(c => c.OPCRs.Where(o => !o.IsDeleted))
                .ThenInclude(o => o.OPCRItems.Where(i => !i.IsDeleted))
                    .ThenInclude(i => i.KPIAssignment)
                        .ThenInclude(a => a.FYActiveKPI!)
                            .ThenInclude(fy => fy.MFOPAP)
            // OPCRs → Items → KPIAssignment → FYActiveKPI → MasterKPI → MFOPAP (preferred)
            .Include(c => c.OPCRs.Where(o => !o.IsDeleted))
                .ThenInclude(o => o.OPCRItems.Where(i => !i.IsDeleted))
                    .ThenInclude(i => i.KPIAssignment)
                        .ThenInclude(a => a.FYActiveKPI!)
                            .ThenInclude(fy => fy.MasterKPI)
                                .ThenInclude(k => k!.MFOPAP)
            // OPCRs → Items → KPIAssignment → Office (for OfficeName)
            .Include(c => c.OPCRs.Where(o => !o.IsDeleted))
                .ThenInclude(o => o.OPCRItems.Where(i => !i.IsDeleted))
                    .ThenInclude(i => i.KPIAssignment)
                        .ThenInclude(a => a.Office)
            // OPCRs → Items → Activities
            .Include(c => c.OPCRs.Where(o => !o.IsDeleted))
                .ThenInclude(o => o.OPCRItems.Where(i => !i.IsDeleted))
                    .ThenInclude(i => i.OPCRActivities.Where(a => !a.IsDeleted))
            .AsSplitQuery()
            .FirstOrDefaultAsync(cancellationToken);
    }
}