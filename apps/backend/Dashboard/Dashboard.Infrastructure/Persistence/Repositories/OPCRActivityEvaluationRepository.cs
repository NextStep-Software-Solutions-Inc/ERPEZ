using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class OPCRActivityEvaluationRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<OPCRActivityEvaluation>(context, sieveProcessor), IOPCRActivityEvaluationRepository
{
    private readonly ApplicationDbContext context = context;

    public Task<OPCRActivityEvaluation?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return context.Set<OPCRActivityEvaluation>()
            .Include(e => e.OPCRActivityRating)
                .ThenInclude(r => r.OPCRActivity)
                    .ThenInclude(a => a.OPCRItem)
            .Include(e => e.OPCRActivityRating)
                .ThenInclude(r => r.PerformanceMeasure)
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
    }
}
