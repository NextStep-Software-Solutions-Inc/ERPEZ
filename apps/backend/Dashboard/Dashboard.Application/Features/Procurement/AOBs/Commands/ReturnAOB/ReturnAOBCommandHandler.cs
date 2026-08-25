using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.AOBs.Commands.ReturnAOB;

public class ReturnAOBCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<ReturnAOBCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(ReturnAOBCommand request, CancellationToken cancellationToken)
    {
        var aob = await unitOfWork.AOBRepository.Query()
            .FirstOrDefaultAsync(a => a.Id == request.AOBId && !a.IsDeleted, cancellationToken);

        if (aob == null)
        {
            return ApiResponse<Unit>.Fail("Abstract of Bids (AOB) not found.");
        }

        if (aob.Status == StatusEnum.Approved)
        {
            return ApiResponse<Unit>.Fail("Approved Abstract of Bids (AOB) cannot be returned.");
        }

        aob.Status = StatusEnum.Returned;
        aob.Remarks = request.Remarks;
        aob.UpdatedAt = DateTime.UtcNow;
        aob.UpdatedBy = "System";

        unitOfWork.AOBRepository.Update(aob);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "AOB returned to BAC Secretariat for revision.");
    }
}
