using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class MarketScopingActivityRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Domain.Entities.Planning.MarketScopingActivity>(context, sieveProcessor), IMarketScopingActivityRepository
{
    private readonly ApplicationDbContext context = context;

    public async Task<List<Domain.Entities.Planning.MarketScopingActivity>> GetByMarketScopingIdAsync(
        Guid marketScopingId, CancellationToken cancellationToken = default)
    {
        return await context.Set<Domain.Entities.Planning.MarketScopingActivity>()
            .Where(x => x.MarketScopingId == marketScopingId && !x.IsDeleted)
            .ToListAsync(cancellationToken);
    }
}
