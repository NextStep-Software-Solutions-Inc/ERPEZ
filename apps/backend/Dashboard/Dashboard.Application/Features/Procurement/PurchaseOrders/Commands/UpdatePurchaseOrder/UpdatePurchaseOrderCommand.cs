using System;
using System.Text.Json.Serialization;
using ERPEZ.Application.Features.Procurement.PurchaseOrders.DTOs;
using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseOrders.Commands.UpdatePurchaseOrder;

public record UpdatePurchaseOrderCommand : IRequest<ApiResponse<bool>>
{
    [JsonIgnore]
    public Guid Id { get; init; }
    
    public string PONumber { get; init; } = string.Empty;
    public POProcurementModeEnum ProcurementMode { get; init; }
    public SourceDocumentTypeEnum SourceDocumentType { get; init; }
    public Guid SourceDocumentId { get; init; }
    public Guid? SupplierId { get; init; }
    public RetailStoreInfoDto? RetailStoreInfo { get; init; }
    public string? Description { get; init; }
    public DateOnly Date { get; init; }
    public string? PlaceOfDelivery { get; init; }
    public DateOnly? DateOfDelivery { get; init; }
    public string? DeliveryTerm { get; init; }
    public string? PaymentTerm { get; init; }
    public string? SupportingDocumentUrl { get; init; }
}
