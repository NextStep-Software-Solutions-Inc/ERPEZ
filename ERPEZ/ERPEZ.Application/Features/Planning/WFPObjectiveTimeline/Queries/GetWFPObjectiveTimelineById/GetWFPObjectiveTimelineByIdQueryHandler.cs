using ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Queries.GetWFPObjectiveTimelineById;

public class GetWFPObjectiveTimelineByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetWFPObjectiveTimelineByIdQuery, ApiResponse<WFPObjectiveTimelineResponse>>
{
    public async Task<ApiResponse<WFPObjectiveTimelineResponse>> Handle(GetWFPObjectiveTimelineByIdQuery request, CancellationToken cancellationToken)
    {
        var wfpObjectiveTimeline = await unitOfWork.WFPObjectiveTimelineRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        var result = new WFPObjectiveTimelineResponse()
        {
            Id = wfpObjectiveTimeline.Id,
            WFPObjectiveTargetId = wfpObjectiveTimeline.WFPObjectiveTargetId,
            StartDate = wfpObjectiveTimeline.StartDate,
            EndDate = wfpObjectiveTimeline.EndDate,
            TargetValue = wfpObjectiveTimeline.TargetValue,
            CreatedAt = wfpObjectiveTimeline.CreatedAt,
            CreatedBy = wfpObjectiveTimeline.CreatedBy
        };
        return ApiResponse<WFPObjectiveTimelineResponse>.Success(result, "Retrieved successfully");
    }
}
