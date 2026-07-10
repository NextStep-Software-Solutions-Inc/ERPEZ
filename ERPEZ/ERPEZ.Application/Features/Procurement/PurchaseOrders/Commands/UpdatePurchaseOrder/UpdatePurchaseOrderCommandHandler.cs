using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Procurement.PurchaseOrders.Commands.UpdatePurchaseOrder;

public class UpdatePurchaseOrderCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<UpdatePurchaseOrderCommand, ApiResponse<bool>>
{
    // Note: Currently, purchase order items can only be managed on creation (or a separate items update endpoint/feature can be added in a follow-up ticket).
    public async Task<ApiResponse<bool>> Handle(UpdatePurchaseOrderCommand request, CancellationToken cancellationToken)
    {
        var purchaseOrder = await unitOfWork.PurchaseOrderRepository.GetByIdAsync(request.Id, cancellationToken);
        
        if (purchaseOrder == null)
            return ApiResponse<bool>.Fail("Purchase Order not found.");

        if (purchaseOrder.Status != StatusEnum.Draft && purchaseOrder.Status != StatusEnum.Returned)
            return ApiResponse<bool>.Fail("Only Draft or Returned Purchase Orders can be updated.");

        purchaseOrder.PONumber = request.PONumber;
        purchaseOrder.ProcurementMode = request.ProcurementMode;
        purchaseOrder.SourceDocumentType = request.SourceDocumentType;
        purchaseOrder.SourceDocumentId = request.SourceDocumentId;
        purchaseOrder.SupplierId = request.SupplierId;
        purchaseOrder.Description = request.Description;
        purchaseOrder.Date = request.Date;
        purchaseOrder.PlaceOfDelivery = request.PlaceOfDelivery;
        purchaseOrder.DateOfDelivery = request.DateOfDelivery;
        purchaseOrder.DeliveryTerm = request.DeliveryTerm;
        purchaseOrder.PaymentTerm = request.PaymentTerm;
        purchaseOrder.SupportingDocumentUrl = request.SupportingDocumentUrl;

        unitOfWork.PurchaseOrderRepository.Update(purchaseOrder);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.Success(true, "Purchase Order updated successfully.");
    }
}
