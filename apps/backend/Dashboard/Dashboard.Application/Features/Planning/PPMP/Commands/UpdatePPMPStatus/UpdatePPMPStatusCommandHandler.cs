using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMP.Commands.UpdatePPMPStatus;

public class UpdatePPMPStatusCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdatePPMPStatusCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdatePPMPStatusCommand request, CancellationToken cancellationToken)
    {
        var ppmp = await unitOfWork.PPMPRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("PPMP not found.");

        if (!Enum.TryParse<StatusEnum>(request.Action, ignoreCase: true, out var newStatus))
            throw new ValidationException($"Invalid status '{request.Action}'. Valid values: {string.Join(", ", Enum.GetNames<StatusEnum>())}");

        ppmp.Status = newStatus;

        if (ppmp.Status == StatusEnum.Submitted)
            ppmp.SubmittedDate = DateTime.UtcNow;
        else if (ppmp.Status == StatusEnum.Approved)
            ppmp.ApprovedDate = DateTime.UtcNow;

        unitOfWork.PPMPRepository.Update(ppmp);

        var defaultRole = newStatus switch
        {
            StatusEnum.Submitted => "Submitter",
            StatusEnum.Returned => "Reviewer",
            StatusEnum.Approved => "Approver",
            _ => "User"
        };

        var approvalEvent = new ApprovalEvent
        {
            PPMPId = ppmp.Id,
            Role = !string.IsNullOrWhiteSpace(request.Role) ? request.Role : defaultRole,
            Action = newStatus.ToString(),
            ActorId = Guid.Empty,
            ActorName = string.IsNullOrWhiteSpace(request.ActorName) ? "System User" : request.ActorName,
            Notes = request.Notes,
            Timestamp = DateTime.UtcNow
        };

        await unitOfWork.ApprovalEventRepository.AddAsync(approvalEvent, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "PPMP status updated successfully.");
    }
}