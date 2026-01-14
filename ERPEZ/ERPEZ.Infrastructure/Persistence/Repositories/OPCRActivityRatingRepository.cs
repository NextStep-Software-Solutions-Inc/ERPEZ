using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class OPCRActivityRatingRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<OPCRActivityRating>(context, sieveProcessor), IOPCRActivityRatingRepository
{
    private readonly ApplicationDbContext context = context;

    public Task<OPCRActivityRating?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return context.Set<OPCRActivityRating>()
            .Include(r => r.OPCRActivity)
                .ThenInclude(a => a.DUKPITargetAssignment)
                    .ThenInclude(t => t.KPI)
                        .ThenInclude(k => k.KPIPerformanceMeasures)
            .Include(r => r.PerformanceMeasure)
            .Include(r => r.OPCRActivityEvaluations)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }
}
