namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;

public record CreateConsolidatedPRRequest
{
    public DateOnly ConsolidationDate { get; init; }
    public string? Description { get; init; }
    public string? Purpose { get; init; }
}

/// <summary>Request body for POST /consolidated-prs/{id}/prs</summary>
public record AddPRsToConsolidatedRequest
{
    public List<Guid> PurchaseRequestIds { get; init; } = [];
}

/// <summary>Request body for PATCH /consolidated-prs/{id}/items/{itemId}</summary>
public record UpdateConsolidatedPRItemRequest
{
    public Guid? ProcurementModeId { get; init; }
    public bool AllowPartial { get; init; }
}