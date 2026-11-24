using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.AOBs.Commands.SubmitAOB;

public class SubmitAOBCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<SubmitAOBCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(SubmitAOBCommand request, CancellationToken cancellationToken)
    {
        var aob = await unitOfWork.AOBRepository.Query()
            .Include(a => a.AOBAwardedItems)
            .Include(a => a.AOBRFQMappings)
            .FirstOrDefaultAsync(a => a.Id == request.AOBId && !a.IsDeleted, cancellationToken);

        if (aob == null)
        {
            return ApiResponse<Unit>.Fail("Abstract of Bids (AOB) not found.");
        }

        if (aob.Status != StatusEnum.Draft && aob.Status != StatusEnum.Returned)
        {
            return ApiResponse<Unit>.Fail($"AOB in status '{aob.Status}' cannot be submitted for approval. Must be Draft or Returned.");
        }

        if (aob.AOBRFQMappings.Count == 0)
        {
            return ApiResponse<Unit>.Fail("Cannot submit an AOB without linked RFQs.");
        }

        if (aob.AOBAwardedItems.Count == 0)
        {
            return ApiResponse<Unit>.Fail("Cannot submit an AOB for approval without selecting winning bidders.");
        }

        aob.Status = StatusEnum.ForApproval;
        aob.SubmittedBy = request.SubmittedBy;
        aob.SubmittedAt = DateTime.UtcNow;
        aob.UpdatedAt = DateTime.UtcNow;
        aob.UpdatedBy = "System";

        unitOfWork.AOBRepository.Update(aob);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "AOB submitted for BAC Chair approval successfully.");
    }
}
