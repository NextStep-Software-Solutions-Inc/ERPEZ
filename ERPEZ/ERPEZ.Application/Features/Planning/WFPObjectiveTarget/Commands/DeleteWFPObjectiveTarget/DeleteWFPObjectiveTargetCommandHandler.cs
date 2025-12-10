using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Commands.DeleteWFPObjectiveTarget;

public class DeleteWFPObjectiveTargetCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<DeleteWFPObjectiveTargetCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(
        DeleteWFPObjectiveTargetCommand request, 
        CancellationToken cancellationToken)
    {
        var target = await unitOfWork.WFPObjectiveTargetRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Activity not found.");

        unitOfWork.WFPObjectiveTargetRepository.Remove(target);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.Success(true, "Activity deleted successfully.");
    }
}
