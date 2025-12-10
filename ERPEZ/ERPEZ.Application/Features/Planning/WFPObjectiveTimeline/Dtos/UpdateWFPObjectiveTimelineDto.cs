namespace ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Dtos;

public class UpdateWFPObjectiveTimelineDto
{
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public decimal? TargetValue { get; set; }
}
