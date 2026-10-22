using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseOrders.Commands.ReturnPurchaseOrder;

public class ReturnPurchaseOrderCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<ReturnPurchaseOrderCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(ReturnPurchaseOrderCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.ReturnReason))
            return ApiResponse<bool>.Fail("A reason is required when returning a Purchase Order.");

        var po = await unitOfWork.PurchaseOrderRepository.GetByIdAsync(request.Id, cancellationToken);
        if (po == null)
            return ApiResponse<bool>.Fail("Purchase Order not found.");

        if (po.Status != StatusEnum.ForApproval)
            return ApiResponse<bool>.Fail("Only Purchase Orders pending approval can be returned.");

        po.Status = StatusEnum.Returned;
        po.ReturnReason = request.ReturnReason.Trim();

        unitOfWork.PurchaseOrderRepository.Update(po);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.Success(true, "Purchase Order returned successfully.");
    }
}
