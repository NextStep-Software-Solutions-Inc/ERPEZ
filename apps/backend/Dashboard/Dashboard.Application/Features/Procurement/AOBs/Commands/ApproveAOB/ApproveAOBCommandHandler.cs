using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.AOBs.Commands.ApproveAOB;

public class ApproveAOBCommandHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService)
    : IRequestHandler<ApproveAOBCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(ApproveAOBCommand request, CancellationToken cancellationToken)
    {
        var aob = await unitOfWork.AOBRepository.Query()
            .Include(a => a.AOBAwardedItems)
            .FirstOrDefaultAsync(a => a.Id == request.AOBId && !a.IsDeleted, cancellationToken);

        if (aob == null)
        {
            return ApiResponse<Unit>.Fail("Abstract of Bids (AOB) not found.");
        }

        if (aob.Status == StatusEnum.Approved)
        {
            return ApiResponse<Unit>.Fail("This AOB has already been approved.");
        }

        if (aob.AOBAwardedItems.Count == 0)
        {
            return ApiResponse<Unit>.Fail("Cannot approve an AOB with no awarded winners.");
        }

        Guid? approverId = request.ApprovedBy;
        if (!approverId.HasValue && Guid.TryParse(currentUserService.UserId, out var parsedUserId))
        {
            approverId = parsedUserId;
        }

        var actorName = !string.IsNullOrWhiteSpace(request.ApprovedByName)
            ? request.ApprovedByName
            : (!string.IsNullOrWhiteSpace(currentUserService.Name)
                ? currentUserService.Name
                : (!string.IsNullOrWhiteSpace(currentUserService.Username) ? currentUserService.Username : "BAC Chairperson"));

        aob.Status = StatusEnum.Approved;
        aob.ApprovedBy = approverId;
        aob.ApprovedAt = DateTime.UtcNow;
        aob.SignedDocumentUrl = request.SignedDocumentUrl ?? aob.SignedDocumentUrl;
        aob.Remarks = request.Remarks ?? aob.Remarks;
        aob.UpdatedAt = DateTime.UtcNow;
        aob.UpdatedBy = actorName;

        unitOfWork.AOBRepository.Update(aob);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "AOB approved successfully by BAC Chairperson.");
    }
}
