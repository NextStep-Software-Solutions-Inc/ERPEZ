using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMP.Commands.SubmitPPMPForApproval;

public class SubmitPPMPForApprovalCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<SubmitPPMPForApprovalCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(SubmitPPMPForApprovalCommand request, CancellationToken cancellationToken)
    {
        await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            var ppmp = await unitOfWork.PPMPRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
                ?? throw new NotFoundException("PPMP not found.");

            // Only allow submission of Draft or Returned status
            if (ppmp.Status != ERPEZ.Domain.Enums.StatusEnum.Draft && ppmp.Status != ERPEZ.Domain.Enums.StatusEnum.Returned)
                throw new ValidationException($"Cannot submit PPMP in {ppmp.Status} status.");

            // Update status
            ppmp.Status = ERPEZ.Domain.Enums.StatusEnum.Submitted;
            ppmp.SubmittedDate = DateTime.UtcNow;

            unitOfWork.PPMPRepository.Update(ppmp);

            // Create approval event
            var approvalEvent = new ApprovalEvent
            {
                PPMPId = ppmp.Id,
                Role = "Submitter",
                Action = "Submitted",
                ActorId = Guid.Empty,
                ActorName = request.SubmittedBy,
                Timestamp = DateTime.UtcNow
            };

            await unitOfWork.ApprovalEventRepository.AddAsync(approvalEvent, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }, cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "PPMP submitted for approval successfully.");
    }
}
