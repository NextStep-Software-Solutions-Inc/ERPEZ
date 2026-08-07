using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class OPCRActivityMOVRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<OPCRActivityMOV>(context, sieveProcessor), IOPCRActivityMOVRepository
{
    private readonly ApplicationDbContext context = context;

    public Task<OPCRActivityMOV?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return context.Set<OPCRActivityMOV>()
            .Include(m => m.OPCRActivity)
                .ThenInclude(a => a.OPCRItem)
                    .ThenInclude(i => i.KPIAssignment)
                        .ThenInclude(a => a.FYActiveKPI)
                            .ThenInclude(f => f!.MasterKPI)
            .FirstOrDefaultAsync(m => m.Id == id, cancellationToken);
    }
}
