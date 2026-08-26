using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class MarketScopingParameterRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Domain.Entities.Planning.MarketScopingParameter>(context, sieveProcessor), IMarketScopingParameterRepository
{
    private readonly ApplicationDbContext context = context;
    private readonly ISieveProcessor sieveProcessor = sieveProcessor;

    public async Task<List<Domain.Entities.Planning.MarketScopingParameter>> GetByMarketScopingIdAsync(
        Guid marketScopingId, CancellationToken cancellationToken = default)
    {
        return await context.Set<Domain.Entities.Planning.MarketScopingParameter>()
            .Where(x => x.MarketScopingId == marketScopingId && !x.IsDeleted)
            .ToListAsync(cancellationToken);
    }

    public async Task<(IEnumerable<Domain.Entities.Planning.MarketScopingParameter>, int)> GetByMarketScopingIdAsync(
        Guid marketScopingId, SieveModel sieveModel, CancellationToken cancellationToken = default)
    {
        var query = context.Set<Domain.Entities.Planning.MarketScopingParameter>()
            .Include(x => x.ParameterSettings)
            .Where(x => x.MarketScopingId == marketScopingId && !x.IsDeleted)
            .AsNoTracking();

        var filteredQuery = sieveProcessor.Apply(sieveModel, query, applyPagination: false);
        var totalCount = await filteredQuery.CountAsync(cancellationToken);
        var result = await sieveProcessor.Apply(sieveModel, filteredQuery).ToListAsync(cancellationToken);

        return ((IEnumerable<Domain.Entities.Planning.MarketScopingParameter>)result, totalCount);
    }
}
