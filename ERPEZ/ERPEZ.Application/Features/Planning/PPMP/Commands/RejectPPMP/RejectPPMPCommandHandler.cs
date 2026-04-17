using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMP.Commands.RejectPPMP;

public class RejectPPMPCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<RejectPPMPCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(RejectPPMPCommand request, CancellationToken cancellationToken)
    {
        await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            var ppmp = await unitOfWork.PPMPRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
                ?? throw new NotFoundException("PPMP not found.");

            // Only allow rejection of Submitted status
            if (ppmp.Status != ERPEZ.Domain.Enums.StatusEnum.Submitted)
                throw new ValidationException($"Cannot reject PPMP in {ppmp.Status} status.");

            // Update status
            ppmp.Status = ERPEZ.Domain.Enums.StatusEnum.Returned;

            unitOfWork.PPMPRepository.Update(ppmp);

            // Create approval event
            var approvalEvent = new ApprovalEvent
            {
                PPMPId = ppmp.Id,
                Role = request.Role,
                Action = "Rejected",
                ActorId = Guid.Empty,
                ActorName = request.RejectedBy,
                Notes = request.Reason,
                Timestamp = DateTime.UtcNow
            };

            await unitOfWork.ApprovalEventRepository.AddAsync(approvalEvent, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }, cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "PPMP rejected successfully.");
    }
}
