using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseOrders.Commands.ApprovePurchaseOrder;

public class ApprovePurchaseOrderCommandHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService)
    : IRequestHandler<ApprovePurchaseOrderCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(ApprovePurchaseOrderCommand request, CancellationToken cancellationToken)
    {
        var po = await unitOfWork.PurchaseOrderRepository.GetByIdAsync(request.Id, cancellationToken);
        if (po == null)
            return ApiResponse<bool>.Fail("Purchase Order not found.");

        if (po.Status != StatusEnum.ForApproval)
            return ApiResponse<bool>.Fail("Only Purchase Orders pending approval can be approved.");

        Guid? actorId = null;
        if (Guid.TryParse(currentUserService.UserId, out var parsedActorId))
        {
            actorId = parsedActorId;
        }

        po.Status = StatusEnum.Approved;
        po.ApprovedById = actorId;
        po.ApprovedAt = DateTime.UtcNow;

        unitOfWork.PurchaseOrderRepository.Update(po);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.Success(true, "Purchase Order approved successfully.");
    }
}
