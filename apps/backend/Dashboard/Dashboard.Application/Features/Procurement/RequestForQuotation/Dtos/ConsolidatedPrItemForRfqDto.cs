using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Dtos;

/// <summary>Row shape for the "Add Consolidated PR" modal — CPR -> Items, Jan-Dec breakdown.</summary>
public record ConsolidatedPrItemForRFQDto
{
    public Guid CPRItemId { get; init; }
    public Guid ConsolidatedPRId { get; init; }
    public string CPRNumber { get; init; } = string.Empty;
    public string ItemName { get; init; } = string.Empty;
    public string? Category { get; init; }
    public string? Fund { get; init; }
    public AllocationMonthEnum Month { get; init; } = AllocationMonthEnum.January;
    public decimal UnitCost { get; init; }
    public int RequestedQuantity { get; init; }
    public int AlreadySourcedQuantity { get; init; }
    public int RemainingQuantity => RequestedQuantity - AlreadySourcedQuantity;
    public Guid ProcurementModeId { get; init; }
    public string? ProcurementModeName { get; init; }
    public bool HasBACResolution { get; init; }
    public string? BACResolutionStatus { get; init; }
    public string? BACResolutionNumber { get; init; }
    public Guid? BACResolutionId { get; init; }
}
