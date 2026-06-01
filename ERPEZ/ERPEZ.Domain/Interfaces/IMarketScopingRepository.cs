using ERPEZ.Domain.Entities.Planning;
using Sieve.Models;

namespace ERPEZ.Domain.Interfaces;

public interface IMarketScopingRepository : IRepository<MarketScoping>
{
    Task<MarketScoping?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<(IEnumerable<MarketScoping>, int)> GetAllWithDetailsAsync(SieveModel sieveModel, CancellationToken cancellationToken = default);
    Task<List<MarketScoping>> GetAllWithDetailsAsync(bool includeDeleted = false, CancellationToken cancellationToken = default);
}
