using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using ERPEZ.Application.Features.Planning.OPCR.Commands.UpdateOPCRCommitmentStatus;

namespace ERPEZ.Application.Features.Planning.OPCR.Commands.UpdateOPCRCommitmentStatus;

public class UpdateOPCRCommitmentStatusCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateOPCRCommitmentStatusCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(
        UpdateOPCRCommitmentStatusCommand request, CancellationToken cancellationToken)
    {
        var opcr = await unitOfWork.OPCRRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("OPCR not found.");

        opcr.CommitmentStatus = request.Request.CommitmentStatus;

        if (request.Request.CommitmentStatus.Equals("Submitted", StringComparison.OrdinalIgnoreCase))
            opcr.SubmittedDate = DateTime.UtcNow;

        if (request.Request.CommitmentStatus.Equals("Approved", StringComparison.OrdinalIgnoreCase))
            opcr.ApprovedDate = DateTime.UtcNow;

        unitOfWork.OPCRRepository.Update(opcr);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Commitment status updated successfully.");
    }
}
