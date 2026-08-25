using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.AOBs.Commands.ApproveAOB;

public class ApproveAOBCommandHandler(IUnitOfWork unitOfWork)
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

        aob.Status = StatusEnum.Approved;
        aob.ApprovedBy = request.ApprovedBy;
        aob.ApprovedAt = DateTime.UtcNow;
        aob.SignedDocumentUrl = request.SignedDocumentUrl ?? aob.SignedDocumentUrl;
        aob.Remarks = request.Remarks ?? aob.Remarks;
        aob.UpdatedAt = DateTime.UtcNow;
        aob.UpdatedBy = "System";

        unitOfWork.AOBRepository.Update(aob);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "AOB approved successfully by BAC Chairperson.");
    }
}
