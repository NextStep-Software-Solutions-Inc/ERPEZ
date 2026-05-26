using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IMarketScopingParameterRepository : IRepository<MarketScopingParameter>
{
    Task<List<MarketScopingParameter>> GetByMarketScopingIdAsync(Guid marketScopingId, CancellationToken cancellationToken = default);
}
