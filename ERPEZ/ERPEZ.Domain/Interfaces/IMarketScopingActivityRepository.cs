using ERPEZ.Domain.Entities.Planning;
using Sieve.Models;

namespace ERPEZ.Domain.Interfaces;

public interface IMarketScopingActivityRepository : IRepository<MarketScopingActivity>
{
    Task<List<MarketScopingActivity>> GetByMarketScopingIdAsync(Guid marketScopingId, CancellationToken cancellationToken = default);
    Task<(IEnumerable<MarketScopingActivity>, int)> GetByMarketScopingIdAsync(Guid marketScopingId, SieveModel sieveModel, CancellationToken cancellationToken = default);
}
