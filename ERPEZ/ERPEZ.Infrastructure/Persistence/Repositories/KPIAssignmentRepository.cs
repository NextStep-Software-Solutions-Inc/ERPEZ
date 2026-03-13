using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class KPIAssignmentRepository : Repository<Domain.Entities.Planning.KPIAssignment>, IKPIAssignmentRepository
{
    private readonly ApplicationDbContext context;

    public KPIAssignmentRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
    }

    public async Task<List<Domain.Entities.Planning.KPIAssignment>> GetAssignmentsByFYActiveKPIIdAsync(Guid fyActiveKPIId, CancellationToken cancellationToken = default)
    {
        return await context.Set<Domain.Entities.Planning.KPIAssignment>()
            .Where(a => a.FYActiveKPIId == fyActiveKPIId)
            .Include(a => a.Office)
            .ToListAsync(cancellationToken);
    }
}
