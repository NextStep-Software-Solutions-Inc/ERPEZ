using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Dtos;

public record RFQListItemDto
{
    public Guid Id { get; init; }
    public string RFQNumber { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string TracingNumber { get; init; } = string.Empty;
    public string? ModeOfProcurementName { get; init; }
    public DateOnly? Deadline { get; init; }
    public string? DeliveryPeriod { get; init; }
    public StatusEnum Status { get; init; }
}

public record RFQDetailDto
{
    public Guid Id { get; init; }
    public string RFQNumber { get; init; } = string.Empty;
    public string TracingNumber { get; init; } = string.Empty;
    public string? Description { get; init; }
    public Guid? ModeOfProcurementId { get; init; }
    public string? ModeOfProcurementName { get; init; }
    public Guid? ConsolidatedPRId { get; init; }
    public string? ConsolidatedPRNumber { get; init; }
    public DateOnly Date { get; init; }
    public DateOnly? Deadline { get; init; }
    public string? DeliveryPeriod { get; init; }
    public string? Purpose { get; init; }
    public string? Remarks { get; init; }
    public StatusEnum Status { get; init; }
    public decimal TotalAmount { get; init; }
    public List<RFQItemDto> Items { get; init; } = [];
    public List<RFQSupplierDto> Suppliers { get; init; } = [];
}

public record RFQItemDto
{
    public Guid Id { get; init; }
    public Guid CPRItemId { get; init; }
    public string ItemNameSnapshot { get; init; } = string.Empty;
    public int Quantity { get; init; }
    public decimal UnitPriceSnapshot { get; init; }
    public decimal TotalPrice => Quantity * UnitPriceSnapshot;
    public bool IsBrochureRequired { get; init; }
    public string? GreenSpecification { get; init; }
    public string? CategorySnapshot { get; init; }
    public string? FundSnapshot { get; init; }
    public List<MonthlyAllocationDto> MonthlyAllocations { get; init; } = [];
}

public record MonthlyAllocationDto(
    string Month,
    int Quantity
);

public record RFQSupplierDto
{
    public Guid SupplierId { get; init; }
    public string SupplierName { get; init; } = string.Empty;
    public DateTime InvitedAt { get; init; }
}
