using ERPEZ.Domain.Enums;
using ERPEZ.Application.Features.Procurement.PurchaseOrders.DTOs;
using ERPEZ.Shared.Common;
using MediatR;
using System;
using System.Collections.Generic;

namespace ERPEZ.Application.Features.Procurement.PurchaseOrders.Commands.CreatePurchaseOrder;

public class CreatePurchaseOrderCommand : IRequest<ApiResponse<Guid>>
{
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

    public List<CreatePurchaseOrderItemDto> Items { get; set; } = new();
}
