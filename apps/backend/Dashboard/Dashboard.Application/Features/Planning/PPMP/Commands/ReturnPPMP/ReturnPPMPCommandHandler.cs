using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMP.Commands.ReturnPPMP;

public class ReturnPPMPCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<ReturnPPMPCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(ReturnPPMPCommand command, CancellationToken cancellationToken)
    {
        var ppmp = await unitOfWork.PPMPRepository.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new NotFoundException("PPMP not found.");

        if (ppmp.Status != StatusEnum.Submitted)
            throw new ValidationException($"Cannot return PPMP in '{ppmp.Status}' status. Only PPMPs in 'Submitted' status can be returned for revision.");

        ppmp.Status = StatusEnum.Returned;

        unitOfWork.PPMPRepository.Update(ppmp);

        var approvalEvent = new ApprovalEvent
        {
            PPMPId = ppmp.Id,
            Role = !string.IsNullOrWhiteSpace(command.Request?.Role) ? command.Request.Role : "Reviewer",
            Action = StatusEnum.Returned.ToString(),
            ActorId = Guid.Empty,
            ActorName = !string.IsNullOrWhiteSpace(command.Request?.ActorName) ? command.Request.ActorName : "Reviewer",
            Notes = command.Request?.Remarks ?? "PPMP returned for revision.",
            Timestamp = DateTime.UtcNow
        };

        await unitOfWork.ApprovalEventRepository.AddAsync(approvalEvent, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "PPMP returned for revision successfully.");
    }
}
