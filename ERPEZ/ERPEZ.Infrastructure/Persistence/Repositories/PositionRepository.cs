using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class PositionRepository : Repository<Domain.Entities.Planning.Position>, Domain.Interfaces.IPositionRepository
{
    private readonly ApplicationDbContext dbContext;

    public PositionRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        dbContext = context;
    }

    public async Task<int> CountByStatusAsync(string status, CancellationToken cancellationToken = default)
    {
        return await dbContext.Positions!
            .CountAsync(p => p.OperationalStatus == status, cancellationToken);
    }

    public async Task<int> CountAllAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.Positions!.CountAsync(cancellationToken);
    }
}
