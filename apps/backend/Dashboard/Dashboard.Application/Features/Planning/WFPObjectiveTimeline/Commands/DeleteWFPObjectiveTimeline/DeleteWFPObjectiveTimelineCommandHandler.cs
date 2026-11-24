using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Commands.DeleteWFPObjectiveTimeline;

public class DeleteWFPObjectiveTimelineCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<DeleteWFPObjectiveTimelineCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(
        DeleteWFPObjectiveTimelineCommand request, 
        CancellationToken cancellationToken)
    {
        var timeline = await unitOfWork.WFPObjectiveTimelineRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Timeline not found.");

        unitOfWork.WFPObjectiveTimelineRepository.Remove(timeline);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.Success(true, "Timeline deleted successfully.");
    }
}
