namespace ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Dtos;

public record UpdateWFPObjectiveTimelineRequest
{
    public string? TimelineType { get; init; }
    public DateOnly? StartDate { get; init; }
    public DateOnly? EndDate { get; init; }
    public decimal? TargetValue { get; init; }
}
