using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMP.Commands.ApprovePPMP;

public class ApprovePPMPCommandHandler(IUnitOfWork unitOfWork)
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

        var approvalEvent = new ApprovalEvent
        {
            PPMPId = ppmp.Id,
            Role = !string.IsNullOrWhiteSpace(command.Request?.Role) ? command.Request.Role : "Approver",
            Action = StatusEnum.Approved.ToString(),
            ActorId = Guid.Empty,
            ActorName = !string.IsNullOrWhiteSpace(command.Request?.ActorName) ? command.Request.ActorName : "Approver",
            Notes = command.Request?.Notes ?? "PPMP approved successfully.",
            Timestamp = DateTime.UtcNow
        };

        await unitOfWork.ApprovalEventRepository.AddAsync(approvalEvent, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "PPMP approved successfully.");
    }
}
