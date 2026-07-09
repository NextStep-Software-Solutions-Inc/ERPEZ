using ERPEZ.Application.Features.Procurement.PurchaseOrders.DTOs;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ERPEZ.Application.Features.Procurement.PurchaseOrders.Queries.GetPurchaseOrderById;

public class GetPurchaseOrderByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetPurchaseOrderByIdQuery, ApiResponse<PurchaseOrderDto>>
{
    public async Task<ApiResponse<PurchaseOrderDto>> Handle(GetPurchaseOrderByIdQuery request, CancellationToken cancellationToken)
    {
        var purchaseOrder = await unitOfWork.PurchaseOrderRepository.GetByIdAsync(request.Id, cancellationToken);
        
        if (purchaseOrder == null)
            return ApiResponse<PurchaseOrderDto>.Fail("Purchase Order not found.");

        var dto = new PurchaseOrderDto
        {
            Id = purchaseOrder.Id,
            PONumber = purchaseOrder.PONumber,
            ProcurementMode = purchaseOrder.ProcurementMode,
            SourceDocumentType = purchaseOrder.SourceDocumentType,
            SourceDocumentId = purchaseOrder.SourceDocumentId,
            SupplierId = purchaseOrder.SupplierId,
            Description = purchaseOrder.Description,
            Date = purchaseOrder.Date,
            PlaceOfDelivery = purchaseOrder.PlaceOfDelivery,
            DateOfDelivery = purchaseOrder.DateOfDelivery,
            DeliveryTerm = purchaseOrder.DeliveryTerm,
            PaymentTerm = purchaseOrder.PaymentTerm,
            Status = purchaseOrder.Status,
            TotalAmount = purchaseOrder.TotalAmount,
            SupportingDocumentUrl = purchaseOrder.SupportingDocumentUrl,
            Items = purchaseOrder.PurchaseOrderItems?.Select(i => new PurchaseOrderItemDto
            {
                Id = i.Id,
                SourceItemId = i.SourceItemId,
                Description = i.Description,
                Quantity = i.Quantity,
                Unit = i.Unit,
                UnitPrice = i.UnitPrice,
                Amount = i.Amount
            }).ToList() ?? new()
        };

        return ApiResponse<PurchaseOrderDto>.Success(dto);
    }
}
