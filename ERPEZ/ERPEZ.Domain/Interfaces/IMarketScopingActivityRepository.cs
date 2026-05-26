using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IMarketScopingActivityRepository : IRepository<MarketScopingActivity>
{
    Task<List<MarketScopingActivity>> GetByMarketScopingIdAsync(Guid marketScopingId, CancellationToken cancellationToken = default);
}
