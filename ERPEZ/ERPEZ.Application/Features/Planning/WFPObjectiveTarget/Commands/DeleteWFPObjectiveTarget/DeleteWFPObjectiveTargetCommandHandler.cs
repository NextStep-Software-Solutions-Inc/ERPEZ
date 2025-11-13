using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Commands.DeleteWFPObjectiveTarget;

public class DeleteWFPObjectiveTargetCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteWFPObjectiveTargetCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteWFPObjectiveTargetCommand request, CancellationToken cancellationToken)
    {
        var wfpObjectiveTarget = await unitOfWork.WFPObjectiveTargetRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("WFP Objective Target not found.");

        unitOfWork.WFPObjectiveTargetRepository.Remove(wfpObjectiveTarget);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"WFP Objective Target with ID {request.Id} deleted successfully.");
    }
}
