using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class MarketScopingParameterRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Domain.Entities.Planning.MarketScopingParameter>(context, sieveProcessor), IMarketScopingParameterRepository
{
    private readonly ApplicationDbContext context = context;

    public async Task<List<Domain.Entities.Planning.MarketScopingParameter>> GetByMarketScopingIdAsync(
        Guid marketScopingId, CancellationToken cancellationToken = default)
    {
        return await context.Set<Domain.Entities.Planning.MarketScopingParameter>()
            .Where(x => x.MarketScopingId == marketScopingId && !x.IsDeleted)
            .ToListAsync(cancellationToken);
    }
}
