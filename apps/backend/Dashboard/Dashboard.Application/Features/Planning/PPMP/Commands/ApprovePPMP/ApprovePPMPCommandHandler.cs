using ERPEZ.Application.Common.Helpers;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Interfaces;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMP.Commands.ApprovePPMP;

public class ApprovePPMPCommandHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService? currentUser = null)
    : IRequestHandler<ApprovePPMPCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(ApprovePPMPCommand command, CancellationToken cancellationToken)
    {
        var ppmp = await unitOfWork.PPMPRepository.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new NotFoundException("PPMP not found.");

        if (ppmp.Status != StatusEnum.Submitted)
            throw new ValidationException($"Cannot approve PPMP in '{ppmp.Status}' status. Only PPMPs in 'Submitted' status can be approved.");

        ppmp.Status = StatusEnum.Approved;
        ppmp.ApprovedDate = DateTime.UtcNow;

        unitOfWork.PPMPRepository.Update(ppmp);

        var actorName = command.Request?.ActorName;
        var actorId = Guid.Empty;

        if (string.IsNullOrWhiteSpace(actorName))
        {
            if (!string.IsNullOrWhiteSpace(currentUser?.ExternalIdentityId) && unitOfWork.UserRepository != null)
            {
                var user = await unitOfWork.UserRepository.GetByExternalIdentityIdAsync(currentUser.ExternalIdentityId, cancellationToken);
                if (user != null)
                {
                    actorId = user.Id;
                    actorName = user.FullName;
                }
            }

            if (string.IsNullOrWhiteSpace(actorName))
            {
                var wf = await DocumentSignatoryResolver.ResolveWorkflowApproversAsync(
                    unitOfWork, ppmp.OfficeId, ppmp.FiscalYearId, "PPMP", cancellationToken);
                if (wf.FinalApprover != null && !string.IsNullOrWhiteSpace(wf.FinalApprover.FullName))
                {
                    actorId = wf.FinalApprover.UserId ?? Guid.Empty;
                    actorName = wf.FinalApprover.FullName;
                }
            }
        }

        var approvalEvent = new ApprovalEvent
        {
            PPMPId = ppmp.Id,
            Role = !string.IsNullOrWhiteSpace(command.Request?.Role) ? command.Request.Role : "Approver",
            Action = StatusEnum.Approved.ToString(),
            ActorId = actorId,
            ActorName = !string.IsNullOrWhiteSpace(actorName) ? actorName : "Approver",
            Notes = command.Request?.Notes ?? "PPMP approved successfully.",
            Timestamp = DateTime.UtcNow
        };

        await unitOfWork.ApprovalEventRepository.AddAsync(approvalEvent, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "PPMP approved successfully.");
    }
}
