using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Commands.CreateWFPObjectiveTimeline;

public class CreateWFPObjectiveTimelineCommand : IRequest<ApiResponse<Guid>>
{
    public Guid WFPObjectiveTargetId { get; set; }
    public string TimelineType { get; set; } = string.Empty;
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public decimal TargetValue { get; set; }
}
