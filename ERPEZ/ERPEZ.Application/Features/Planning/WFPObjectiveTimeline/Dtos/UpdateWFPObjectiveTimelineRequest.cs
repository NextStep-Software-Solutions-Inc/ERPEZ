namespace ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Dtos;

public class UpdateWFPObjectiveTimelineRequest
{
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public decimal? TargetValue { get; set; }
}
