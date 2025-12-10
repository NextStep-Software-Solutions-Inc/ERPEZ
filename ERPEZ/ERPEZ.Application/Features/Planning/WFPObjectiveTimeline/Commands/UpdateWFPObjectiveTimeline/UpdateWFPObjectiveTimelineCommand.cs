using ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Commands.UpdateWFPObjectiveTimeline;

public class UpdateWFPObjectiveTimelineCommand : IRequest<ApiResponse<WFPObjectiveTimelineDto>>
{
    public Guid Id { get; set; }
    public required UpdateWFPObjectiveTimelineDto UpdateWFPObjectiveTimeline { get; set; }
}
