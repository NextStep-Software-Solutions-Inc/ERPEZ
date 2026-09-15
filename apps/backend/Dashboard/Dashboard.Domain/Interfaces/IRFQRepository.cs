using ERPEZ.Domain.Entities.Procurement;
using Sieve.Models;

namespace ERPEZ.Domain.Interfaces;

/// <summary>
/// Repository for RFQ aggregate root. Exposed as a named property on IUnitOfWork
/// (unitOfWork.RFQRepository), per this codebase's convention — no generic Repository&lt;T&gt; factory.
/// </summary>
public interface IRFQRepository : IRepository<RFQ>
{
    Task<(IReadOnlyList<RFQ> Entities, int TotalCount)> GetAllWithDetailsAsync(
        SieveModel sieveModel,
        CancellationToken cancellationToken = default);

    Task<RFQ?> GetRFQWithDetailsAsync(Guid rfqId, CancellationToken cancellationToken = default);
    Task<bool> HasRFQNumberAsync(string rfqNumber, CancellationToken cancellationToken = default);
    Task<bool> HasTracingNumberAsync(string tracingNumber, CancellationToken cancellationToken = default);
    Task<RFQItem?> GetItemByIdAsync(Guid rfqItemId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Sum of RFQItem.Quantity already sourced from the given ConsolidatedPRItem across
    /// all RFQs EXCLUDING those in Returned status (a returned RFQ frees up its sourced quantity).
    /// Optionally excludes a specific RFQ (used when re-validating an RFQ's own items on Submit).
    /// Used to enforce the GPPB double-sourcing guard: total sourced quantity for a CPR item
    /// must never exceed PRItem.RequestedQuantity.
    /// </summary>
    Task<int> GetSourcedQuantityForCprItemAsync(
        Guid cprItemId,
        Guid? excludingRfqId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Dashboard summary counters: Total, Draft, Submitted, Approved, Returned.
    /// </summary>
    Task<(int Total, int Draft, int Submitted, int Approved, int Returned)> GetSummaryAsync(
        CancellationToken cancellationToken = default);

    void RemoveItem(RFQItem item);

    Task<Dictionary<Guid, int>> GetSourcedQuantitiesForCprItemsAsync(
        List<Guid> cprItemIds,
        Guid? excludingRfqId = null,
        CancellationToken cancellationToken = default);

    Task<string?> GetLastRFQNumberAsync(int year, CancellationToken cancellationToken = default);

    /// <summary>
    /// Fetches all RFQItems (including soft-deleted records) for a given RFQ that match the specified CPRItemIds.
    /// Used by AddRFQItemsCommandHandler to reactivate/update existing records rather than violating the
    /// IX_RFQItems_RFQId_CPRItemId unique constraint.
    /// </summary>
    Task<List<RFQItem>> GetItemsByRfqAndCprItemIdsAsync(
        Guid rfqId,
        List<Guid> cprItemIds,
        CancellationToken cancellationToken = default);
}
