using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class PositionRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Domain.Entities.Planning.Position>(context, sieveProcessor),
      Domain.Interfaces.IPositionRepository
{
    public async Task<int> CountByStatusAsync(string status, CancellationToken cancellationToken = default)
    {
        return await context.Positions!
            .CountAsync(p => p.OperationalStatus == status, cancellationToken);
    }

    public async Task<int> CountAllAsync(CancellationToken cancellationToken = default)
    {
        return await context.Positions!.CountAsync(cancellationToken);
    }
}
