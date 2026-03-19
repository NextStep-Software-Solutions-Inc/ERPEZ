using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class FYActiveKPIRepository : Repository<Domain.Entities.Planning.FYActiveKPI>, IFYActiveKPIRepository
{
    private readonly ApplicationDbContext context;

    public FYActiveKPIRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
    }

    public async Task<Domain.Entities.Planning.FYActiveKPI?> GetFYActiveKPIWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Set<Domain.Entities.Planning.FYActiveKPI>()
            .Where(f => !f.IsDeleted)
            .Include(f => f.FYActiveKPIMeasurements)
                .ThenInclude(m => m.RatingScaleTemplate)
                    .ThenInclude(r => r!.RatingScaleLevels)
            .Include(f => f.KPIAssignments)
                .ThenInclude(a => a.Office)
            .Include(f => f.FiscalYear)
            .Include(f => f.MasterKPI)
            .Include(f => f.MFOPAP)
            .FirstOrDefaultAsync(f => f.Id == id, cancellationToken);
    }
}
