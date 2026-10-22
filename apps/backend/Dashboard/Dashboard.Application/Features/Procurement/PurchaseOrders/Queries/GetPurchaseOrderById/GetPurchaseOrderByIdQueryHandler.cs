using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.PurchaseOrders.DTOs;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseOrders.Queries.GetPurchaseOrderById;

public class GetPurchaseOrderByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetPurchaseOrderByIdQuery, ApiResponse<PurchaseOrderDto>>
{
    public async Task<ApiResponse<PurchaseOrderDto>> Handle(GetPurchaseOrderByIdQuery request, CancellationToken cancellationToken)
    {
        var purchaseOrder = await unitOfWork.PurchaseOrderRepository.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        
        if (purchaseOrder == null)
            return ApiResponse<PurchaseOrderDto>.Fail("Purchase Order not found.");

        string sourceDocNumber = string.Empty;
        if (purchaseOrder.SourceDocumentType == SourceDocumentTypeEnum.AOB)
        {
            var aob = await unitOfWork.AOBRepository.FindAsync(a => a.Id == purchaseOrder.SourceDocumentId, cancellationToken);
            sourceDocNumber = aob?.AOBNumber ?? string.Empty;
        }
        else if (purchaseOrder.SourceDocumentType == SourceDocumentTypeEnum.NOA)
        {
            var noa = await unitOfWork.NoticeOfAwardRepository.FindAsync(n => n.Id == purchaseOrder.SourceDocumentId, cancellationToken);
            sourceDocNumber = noa?.NOANumber ?? string.Empty;
        }
        else if (purchaseOrder.SourceDocumentType == SourceDocumentTypeEnum.BAC_RESOLUTION)
        {
            var da = await unitOfWork.DirectAcquisitionRepository.GetByIdWithConsolidatedPRAsync(purchaseOrder.SourceDocumentId, cancellationToken);
            sourceDocNumber = !string.IsNullOrWhiteSpace(da?.DANumber)
                ? da.DANumber
                : (da?.ConsolidatedPR?.CPRNumber ?? purchaseOrder.SourceDocumentId.ToString());
        }

        var dto = new PurchaseOrderDto
        {
            Id = purchaseOrder.Id,
            PONumber = purchaseOrder.PONumber,
            ProcurementMode = purchaseOrder.ProcurementMode,
            SourceDocumentType = purchaseOrder.SourceDocumentType,
            SourceDocumentId = purchaseOrder.SourceDocumentId,
            SourceDocumentNumber = sourceDocNumber,
            SupplierId = purchaseOrder.SupplierId,
            SupplierName = purchaseOrder.Supplier?.Name ?? string.Empty,
            SupplierAddress = purchaseOrder.Supplier?.Address,
            SupplierTin = purchaseOrder.Supplier?.TINNumber,
            Description = purchaseOrder.Description,
            Date = purchaseOrder.Date,
            PlaceOfDelivery = purchaseOrder.PlaceOfDelivery,
            DateOfDelivery = purchaseOrder.DateOfDelivery,
            DeliveryTerm = purchaseOrder.DeliveryTerm,
            PaymentTerm = purchaseOrder.PaymentTerm,
            Status = purchaseOrder.Status,
            TotalAmount = purchaseOrder.TotalAmount,
            SupportingDocumentUrl = purchaseOrder.SupportingDocumentUrl,
            ReturnReason = purchaseOrder.ReturnReason,
            ApprovedById = purchaseOrder.ApprovedById,
            ApprovedAt = purchaseOrder.ApprovedAt,
            Items = purchaseOrder.PurchaseOrderItems?.Select(i => new PurchaseOrderItemDto
            {
                Id = i.Id,
                SourceItemId = i.SourceItemId,
                Description = i.Description,
                Quantity = i.Quantity,
                Unit = i.Unit,
                UnitPrice = i.UnitPrice,
                Amount = i.Amount
            }).ToList() ?? []
        };

        return ApiResponse<PurchaseOrderDto>.Success(dto);
    }
}
