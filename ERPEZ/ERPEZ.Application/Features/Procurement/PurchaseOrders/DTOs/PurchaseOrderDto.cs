using System;
using System.Collections.Generic;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Procurement.PurchaseOrders.DTOs;

public class PurchaseOrderDto
{
    public Guid Id { get; set; }
    public string PONumber { get; set; } = string.Empty;
    public POProcurementModeEnum ProcurementMode { get; set; }
    public SourceDocumentTypeEnum SourceDocumentType { get; set; }
    public Guid SourceDocumentId { get; set; }
    public Guid SupplierId { get; set; }
    public string? Description { get; set; }
    public DateOnly Date { get; set; }
    public string? PlaceOfDelivery { get; set; }
    public DateOnly? DateOfDelivery { get; set; }
    public string? DeliveryTerm { get; set; }
    public string? PaymentTerm { get; set; }
    public StatusEnum Status { get; set; }
    public decimal TotalAmount { get; set; }
    public string? SupportingDocumentUrl { get; set; }
    public List<PurchaseOrderItemDto> Items { get; set; } = new();
}

public class PurchaseOrderItemDto
{
    public Guid Id { get; set; }
    public Guid SourceItemId { get; set; }
    public string? Description { get; set; }
    public int Quantity { get; set; }
    public string? Unit { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Amount { get; set; }
}
