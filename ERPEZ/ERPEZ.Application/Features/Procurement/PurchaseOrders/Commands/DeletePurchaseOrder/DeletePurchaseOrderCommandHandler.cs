using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Procurement.PurchaseOrders.Commands.DeletePurchaseOrder;

public class DeletePurchaseOrderCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<DeletePurchaseOrderCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(DeletePurchaseOrderCommand request, CancellationToken cancellationToken)
    {
        var purchaseOrder = await unitOfWork.PurchaseOrderRepository.GetByIdAsync(request.Id, cancellationToken);
        
        if (purchaseOrder == null)
            return ApiResponse<bool>.Fail("Purchase Order not found.");

        if (purchaseOrder.Status != StatusEnum.Draft)
            return ApiResponse<bool>.Fail("Only Draft Purchase Orders can be deleted.");

        unitOfWork.PurchaseOrderRepository.Remove(purchaseOrder);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.Success(true, "Purchase Order deleted successfully.");
    }
}
