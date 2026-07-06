using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Dtos;

/// <summary>Row shape for the "Add Consolidated PR" modal — CPR -> Items, Jan-Dec breakdown.</summary>
public class ConsolidatedPrItemForRFQDto
{
    public Guid CPRItemId { get; set; }
    public Guid ConsolidatedPRId { get; set; }
    public string CPRNumber { get; set; } = string.Empty;
    public string ItemName { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string? Fund { get; set; }
    public AllocationMonthEnum Month { get; set; } = AllocationMonthEnum.January;
    public decimal UnitCost { get; set; }
    public int RequestedQuantity { get; set; }
    public int AlreadySourcedQuantity { get; set; }
    public int RemainingQuantity => RequestedQuantity - AlreadySourcedQuantity;
    public Guid ProcurementModeId { get; set; }
    public string? ProcurementModeName { get; set; }
}
