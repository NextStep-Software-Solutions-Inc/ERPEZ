using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Dtos;

public class RFQListItemDto
{
    public Guid Id { get; set; }
    public string RFQNumber { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string TracingNumber { get; set; } = string.Empty;
    public string? ModeOfProcurementName { get; set; }
    public DateOnly? Deadline { get; set; }
    public string? DeliveryPeriod { get; set; }
    public StatusEnum Status { get; set; }
}

public class RFQDetailDto
{
    public Guid Id { get; set; }
    public string RFQNumber { get; set; } = string.Empty;
    public string TracingNumber { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? ModeOfProcurementId { get; set; }
    public string? ModeOfProcurementName { get; set; }
    public DateOnly Date { get; set; }
    public DateOnly? Deadline { get; set; }
    public string? DeliveryPeriod { get; set; }
    public string? Purpose { get; set; }
    public StatusEnum Status { get; set; }
    public decimal TotalAmount { get; set; }
    public List<RFQItemDto> Items { get; set; } = [];
    public List<RFQSupplierDto> Suppliers { get; set; } = [];
}

public class RFQItemDto
{
    public Guid Id { get; set; }
    public Guid CPRItemId { get; set; }
    public string ItemNameSnapshot { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPriceSnapshot { get; set; }
    public decimal TotalPrice => Quantity * UnitPriceSnapshot;
    public bool IsBrochureRequired { get; set; }
    public string? GreenSpecification { get; set; }
    public string? CategorySnapshot { get; set; }
    public string? FundSnapshot { get; set; }
}

public class RFQSupplierDto
{
    public Guid SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public DateTime InvitedAt { get; set; }
}
