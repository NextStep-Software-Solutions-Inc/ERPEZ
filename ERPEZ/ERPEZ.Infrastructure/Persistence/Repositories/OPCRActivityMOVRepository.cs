using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class OPCRActivityMOVRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<OPCRActivityMOV>(context, sieveProcessor), IOPCRActivityMOVRepository
{
    private readonly ApplicationDbContext _context = context;

    public Task<OPCRActivityMOV?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _context.Set<OPCRActivityMOV>()
            .Include(m => m.OPCRActivity)
                .ThenInclude(a => a.DUKPITargetAssignment)
                    .ThenInclude(t => t.KPI)
            .FirstOrDefaultAsync(m => m.Id == id, cancellationToken);
    }
}
