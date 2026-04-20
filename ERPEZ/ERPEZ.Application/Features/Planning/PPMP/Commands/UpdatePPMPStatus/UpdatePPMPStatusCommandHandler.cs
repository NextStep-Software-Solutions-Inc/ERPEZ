using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMP.Commands.UpdatePPMPStatus;

public class UpdatePPMPStatusCommandHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService) : IRequestHandler<UpdatePPMPStatusCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdatePPMPStatusCommand request, CancellationToken cancellationToken)
    {
        if (!currentUserService.IsAuthenticated)
            throw new ValidationException("Authenticated user is required to update PPMP status.");

        if (!Guid.TryParse(currentUserService.UserId, out var actorId))
            throw new ValidationException("Current user ID claim is invalid.");

        var actorName = currentUserService.Name
            ?? currentUserService.Username
            ?? request.ActorName;

        await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            var ppmp = await unitOfWork.PPMPRepository.GetByIdAsync(request.Id, cancellationToken)
                ?? throw new NotFoundException("PPMP not found.");

            var action = request.Action.Trim().ToLowerInvariant();
            var approvalEvent = new ApprovalEvent
            {
                PPMPId = ppmp.Id,
                Role = request.Role ?? "Submitter",
                ActorId = actorId,
                ActorName = actorName,
                Notes = request.Notes,
                Timestamp = DateTime.UtcNow
            };

            switch (action)
            {
                case "submit":
                    if (ppmp.Status != StatusEnum.Draft && ppmp.Status != StatusEnum.Returned)
                        throw new ValidationException($"Cannot submit PPMP in {ppmp.Status} status.");

                    ppmp.Status = StatusEnum.Submitted;
                    ppmp.SubmittedDate = DateTime.UtcNow;
                    approvalEvent.Action = "Submitted";
                    approvalEvent.Role = "Submitter";
                    break;

                case "approve":
                    if (ppmp.Status != StatusEnum.Submitted)
                        throw new ValidationException($"Cannot approve PPMP in {ppmp.Status} status.");

                    ppmp.Status = StatusEnum.Approved;
                    ppmp.ApprovedDate = DateTime.UtcNow;
                    approvalEvent.Action = "Approved";
                    break;

                case "reject":
                    if (ppmp.Status != StatusEnum.Submitted)
                        throw new ValidationException($"Cannot reject PPMP in {ppmp.Status} status.");

                    ppmp.Status = StatusEnum.Returned;
                    approvalEvent.Action = "Rejected";
                    break;

                default:
                    throw new ValidationException("Unsupported action.");
            }

            unitOfWork.PPMPRepository.Update(ppmp);
            await unitOfWork.ApprovalEventRepository.AddAsync(approvalEvent, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }, cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "PPMP status updated successfully.");
    }
}