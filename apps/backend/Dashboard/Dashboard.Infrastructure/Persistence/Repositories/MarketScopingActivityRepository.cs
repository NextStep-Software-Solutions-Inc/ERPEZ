using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class MarketScopingActivityRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Domain.Entities.Planning.MarketScopingActivity>(context, sieveProcessor), IMarketScopingActivityRepository
{
    private readonly ApplicationDbContext context = context;
    private readonly ISieveProcessor sieveProcessor = sieveProcessor;

    public async Task<List<Domain.Entities.Planning.MarketScopingActivity>> GetByMarketScopingIdAsync(
        Guid marketScopingId, CancellationToken cancellationToken = default)
    {
        return await context.Set<Domain.Entities.Planning.MarketScopingActivity>()
            .Where(x => x.MarketScopingId == marketScopingId && !x.IsDeleted)
            .ToListAsync(cancellationToken);
    }

    public async Task<(IEnumerable<Domain.Entities.Planning.MarketScopingActivity>, int)> GetByMarketScopingIdAsync(
        Guid marketScopingId, SieveModel sieveModel, CancellationToken cancellationToken = default)
    {
        var query = context.Set<Domain.Entities.Planning.MarketScopingActivity>()
            .Include(x => x.ActivitySettings)
            .Where(x => x.MarketScopingId == marketScopingId && !x.IsDeleted)
            .AsNoTracking();

        var filteredQuery = sieveProcessor.Apply(sieveModel, query, applyPagination: false);
        var totalCount = await filteredQuery.CountAsync(cancellationToken);
        var result = await sieveProcessor.Apply(sieveModel, filteredQuery).ToListAsync(cancellationToken);

        return ((IEnumerable<Domain.Entities.Planning.MarketScopingActivity>)result, totalCount);
    }
}
