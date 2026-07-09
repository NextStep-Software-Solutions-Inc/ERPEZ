using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;
using System;
using System.Text.Json.Serialization;

namespace ERPEZ.Application.Features.Procurement.PurchaseOrders.Commands.UpdatePurchaseOrder;

public class UpdatePurchaseOrderCommand : IRequest<ApiResponse<bool>>
{
    [JsonIgnore]
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
    public string? SupportingDocumentUrl { get; set; }
}
