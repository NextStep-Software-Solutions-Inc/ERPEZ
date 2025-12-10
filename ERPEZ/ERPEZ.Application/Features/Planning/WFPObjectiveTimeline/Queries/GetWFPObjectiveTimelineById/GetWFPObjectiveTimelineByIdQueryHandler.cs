using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Queries.GetWFPObjectiveTimelineById;

public class GetWFPObjectiveTimelineByIdQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetWFPObjectiveTimelineByIdQuery, ApiResponse<Domain.Entities.Planning.WFPObjectiveTimeline>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.WFPObjectiveTimeline>> Handle(
        GetWFPObjectiveTimelineByIdQuery request, 
        CancellationToken cancellationToken)
    {
        var timeline = await unitOfWork.WFPObjectiveTimelineRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Timeline not found.");

        return ApiResponse<Domain.Entities.Planning.WFPObjectiveTimeline>.Success(timeline, "Retrieved successfully.");
    }
}
