namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Dtos;

/// <summary>
/// Request body for PATCH /market-scopings/{id}/link.
/// Exactly one of the two target fields should be populated (mutually exclusive).
/// </summary>
public record LinkMarketScopingRequest
{
    /// <summary>Project-level target LIB. Mutually exclusive with TargetLineItemBudgetActivityId.</summary>
    public Guid? TargetLineItemBudgetId { get; set; }
    /// <summary>Activity-level target LIB Activity. Mutually exclusive with TargetLineItemBudgetId.</summary>
    public Guid? TargetLineItemBudgetActivityId { get; set; }
    /// <summary>Office context for authorization. Future: derived from auth token.</summary>
    public Guid OfficeId { get; set; }
}
