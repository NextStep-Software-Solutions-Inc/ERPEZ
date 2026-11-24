using System;

namespace ERPEZ.Application.Features.Procurement.DirectAcquisitions.Dtos;

public class DirectAcquisitionCPRItemResponse
{
    public Guid Id { get; set; }
    public Guid PRItemId { get; set; }
    public Guid PurchaseRequestId { get; set; }
    public string PRNumber { get; set; } = string.Empty;
    public string PROffice { get; set; } = string.Empty;
    public string ItemName { get; set; } = string.Empty;
    public string? ItemDescription { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? Fund { get; set; }
    public string? Month { get; set; }
    public string Unit { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalAmount { get; set; }
    public string? ProcurementMode { get; set; }
    public bool AllowPartial { get; set; }
}
