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

        var timelines = await unitOfWork.WFPObjectiveTimelineRepository.ToListAsync(
            unitOfWork.WFPObjectiveTimelineRepository.Query(t => t.WFPObjectiveActivityId == request.Id),
            cancellationToken);

        var expenditures = await unitOfWork.WFPObjectiveActivityExpenditureRepository.ToListAsync(
            unitOfWork.WFPObjectiveActivityExpenditureRepository.Query(e => e.WFPObjectiveActivityId == request.Id),
            cancellationToken);

        unitOfWork.WFPObjectiveTimelineRepository.RemoveRange(timelines);
        unitOfWork.WFPObjectiveActivityExpenditureRepository.RemoveRange(expenditures);
        unitOfWork.WFPObjectiveActivityRepository.Remove(target);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.Success(true, "Activity deleted successfully.");
    }
}
