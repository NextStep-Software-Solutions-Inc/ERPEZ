using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;

public record CreatePRRequest
{
    public DateOnly RequestedDate { get; init; }
    public string PRNumber { get; init; } = string.Empty;
    public Guid? ProcurementCategoryId { get; init; }
    public string? Description { get; init; }
    public string Purpose { get; init; } = string.Empty;
    public Guid OfficeId { get; init; }
    public Guid? PPMPId { get; init; }
    public Guid? FundClusterId { get; init; }
    public Guid? UACSCodeCombinationId { get; init; }
    public PRType PRType { get; init; } = PRType.NonCSE;
    public List<PRItemRequest> Items { get; init; } = [];
}

public record PRItemRequest
{
    // OutOfStockCSE only — null for NonCSE
    public Guid? PPMPItemId { get; init; }
    public Guid? APRItemId { get; init; }

    // Denormalised fields copied from PPMP/APR source
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public decimal UnitCost { get; init; }
    public int RequestedQuantity { get; init; }
    public string? StockNo { get; init; }
    public bool IsNonCSE { get; init; }
    public Dictionary<AllocationMonthEnum, int> MonthlyQuantities { get; init; } = [];
}

public record UpdatePRRequest
{
    public string? Description { get; init; }
    public string? Purpose { get; init; }
    public Guid? FundClusterId { get; init; }
    public Guid? UACSCodeCombinationId { get; init; }
    public Guid? ProcurementCategoryId { get; init; }
    public DateOnly? RequestedDate { get; init; }
    public List<PRItemRequest>? Items { get; init; }
}

public record UpdatePRStatusRequest
{
    public Guid PRId { get; init; }
    public StatusEnum NewStatus { get; init; }
    public string? Remarks { get; init; }
    public string ActorName { get; init; } = string.Empty;
}