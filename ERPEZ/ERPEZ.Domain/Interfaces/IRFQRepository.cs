using ERPEZ.Domain.Entities.Procurement;

namespace ERPEZ.Application.Interfaces;

/// <summary>
/// Repository for RFQ aggregate root. Exposed as a named property on IUnitOfWork
/// (unitOfWork.RFQRepository), per this codebase's convention — no generic Repository&lt;T&gt; factory.
/// </summary>
public interface IRFQRepository
{
    Task<RFQ?> GetByIdAsync(Guid id, bool includeDetails = false, CancellationToken cancellationToken = default);

    Task<RFQ?> GetByRFQNumberAsync(string rfqNumber, CancellationToken cancellationToken = default);

    Task<bool> RFQNumberExistsAsync(string rfqNumber, CancellationToken cancellationToken = default);

    Task<bool> TracingNumberExistsAsync(string tracingNumber, CancellationToken cancellationToken = default);

    Task AddAsync(RFQ rfq, CancellationToken cancellationToken = default);

    void Update(RFQ rfq);

    void Remove(RFQ rfq);

    Task<RFQItem?> GetItemByIdAsync(Guid rfqItemId, CancellationToken cancellationToken = default);

    void RemoveItem(RFQItem item);

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
}
