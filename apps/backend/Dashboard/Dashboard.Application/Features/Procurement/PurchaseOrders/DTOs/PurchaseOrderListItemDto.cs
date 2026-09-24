using System;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Procurement.PurchaseOrders.DTOs;

public class PurchaseOrderListItemDto
{
    public Guid Id { get; set; }
    public string PONumber { get; set; } = string.Empty;
    public POProcurementModeEnum ProcurementMode { get; set; }
    public SourceDocumentTypeEnum SourceDocumentType { get; set; }
    public Guid SourceDocumentId { get; set; }
    public string SourceDocumentNumber { get; set; } = string.Empty;
    public Guid SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public StatusEnum Status { get; set; }
    public DateOnly Date { get; set; }
    public decimal TotalAmount { get; set; }
    public string? ReturnReason { get; set; }
    public Guid? ApprovedById { get; set; }
    public DateTime? ApprovedAt { get; set; }
}
