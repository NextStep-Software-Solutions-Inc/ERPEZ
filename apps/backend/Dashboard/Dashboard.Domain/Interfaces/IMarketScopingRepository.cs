using ERPEZ.Domain.Entities.Planning;
using Sieve.Models;

namespace ERPEZ.Domain.Interfaces;

public interface IMarketScopingRepository : IRepository<MarketScoping>
{
    Task<MarketScoping?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<(IEnumerable<MarketScoping>, int)> GetAllWithDetailsAsync(SieveModel sieveModel, CancellationToken cancellationToken = default);
    Task<List<MarketScoping>> GetAllWithDetailsAsync(bool includeDeleted = false, CancellationToken cancellationToken = default);

    /// <summary>Returns the active MSF targeting the given project-scoped LIB, or null if none exists.</summary>
    Task<MarketScoping?> GetByTargetLineItemBudgetIdAsync(Guid libId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Batch-loads active MSFs for a set of LIB Activity IDs in a single query.
    /// Returns a dictionary keyed by TargetLineItemBudgetActivityId.
    /// </summary>
    Task<Dictionary<Guid, MarketScoping>> GetByTargetLineItemBudgetActivityIdsAsync(
        IEnumerable<Guid> libActivityIds,
        CancellationToken cancellationToken = default);
}
