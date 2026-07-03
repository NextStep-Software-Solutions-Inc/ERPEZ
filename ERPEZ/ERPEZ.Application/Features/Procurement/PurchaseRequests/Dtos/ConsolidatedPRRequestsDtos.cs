namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;

public record CreateConsolidatedPRRequest
{
    public DateOnly ConsolidationDate { get; init; }
    public string? Description { get; init; }
    public string? Purpose { get; init; }
}

public record AddPRsToConsolidatedRequest
{
    public Guid ConsolidatedPRId { get; init; }
    public List<Guid> PurchaseRequestIds { get; init; } = [];  // ← was PRItemIds
}

public record UpdateConsolidatedPRItemRequest
{
    public Guid ConsolidatedPRItemId { get; init; }
    public Guid? ProcurementModeId { get; init; }
    public bool AllowPartial { get; init; }
}