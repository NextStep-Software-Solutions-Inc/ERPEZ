using ERPEZ.Domain.Entities.Planning;
using Sieve.Models;

namespace ERPEZ.Domain.Interfaces;

public interface IMarketScopingParameterRepository : IRepository<MarketScopingParameter>
{
    Task<List<MarketScopingParameter>> GetByMarketScopingIdAsync(Guid marketScopingId, CancellationToken cancellationToken = default);
    Task<(IEnumerable<MarketScopingParameter>, int)> GetByMarketScopingIdAsync(Guid marketScopingId, SieveModel sieveModel, CancellationToken cancellationToken = default);
}
