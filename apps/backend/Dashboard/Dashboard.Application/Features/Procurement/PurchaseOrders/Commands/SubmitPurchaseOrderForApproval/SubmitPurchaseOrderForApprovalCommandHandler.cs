using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseOrders.Commands.SubmitPurchaseOrderForApproval;

public class SubmitPurchaseOrderForApprovalCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<SubmitPurchaseOrderForApprovalCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(SubmitPurchaseOrderForApprovalCommand request, CancellationToken cancellationToken)
    {
        var po = await unitOfWork.PurchaseOrderRepository.GetByIdAsync(request.Id, cancellationToken);
        if (po == null)
            return ApiResponse<bool>.Fail("Purchase Order not found.");

        if (po.Status != StatusEnum.Draft && po.Status != StatusEnum.Returned)
            return ApiResponse<bool>.Fail("Only Draft or Returned Purchase Orders can be submitted for approval.");

        po.Status = StatusEnum.ForApproval;
        po.ReturnReason = null;
        unitOfWork.PurchaseOrderRepository.Update(po);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.Success(true, "Purchase Order submitted for approval successfully.");
    }
}
