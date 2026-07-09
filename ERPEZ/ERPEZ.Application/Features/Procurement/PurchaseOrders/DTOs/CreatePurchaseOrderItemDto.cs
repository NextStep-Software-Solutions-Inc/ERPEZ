using System;

namespace ERPEZ.Application.Features.Procurement.PurchaseOrders.DTOs;

public class CreatePurchaseOrderItemDto
{
    public Guid SourceItemId { get; set; }
    public string? Description { get; set; }
    public int Quantity { get; set; }
    public string? Unit { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Amount { get; set; }
}
