using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveActivity.Commands.DeleteWFPObjectiveActivity;

public class DeleteWFPObjectiveActivityCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<DeleteWFPObjectiveActivityCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(
        DeleteWFPObjectiveActivityCommand request, 
        CancellationToken cancellationToken)
    {
        var target = await unitOfWork.WFPObjectiveActivityRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Activity not found.");

        unitOfWork.WFPObjectiveActivityRepository.Remove(target);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.Success(true, "Activity deleted successfully.");
    }
}
