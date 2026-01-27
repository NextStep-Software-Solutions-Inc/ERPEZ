using ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Queries.GetWFPObjectiveTimelineById;

public class GetWFPObjectiveTimelineByIdQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetWFPObjectiveTimelineByIdQuery, ApiResponse<WFPObjectiveTimelineResponse>>
{
    public async Task<ApiResponse<WFPObjectiveTimelineResponse>> Handle(
        GetWFPObjectiveTimelineByIdQuery request, 
        CancellationToken cancellationToken)
    {
        var timeline = await unitOfWork.WFPObjectiveTimelineRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Timeline not found.");

        var response = new WFPObjectiveTimelineResponse
        {
            Id = timeline.Id,
            WFPObjectiveTargetId = timeline.WFPObjectiveTargetId,
            TimelineType = timeline.TimelineType.ToString(),
            StartDate = timeline.StartDate,
            EndDate = timeline.EndDate,
            TargetValue = timeline.TargetValue,
            CreatedAt = timeline.CreatedAt,
            CreatedBy = timeline.CreatedBy
        };

        return ApiResponse<WFPObjectiveTimelineResponse>.Success(response, "Retrieved successfully.");
    }
}
