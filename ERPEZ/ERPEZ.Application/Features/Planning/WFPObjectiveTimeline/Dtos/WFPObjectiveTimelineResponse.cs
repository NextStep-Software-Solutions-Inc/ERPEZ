namespace ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Dtos;

public record WFPObjectiveTimelineResponse
{
    public Guid Id { get; init; }
    public Guid WFPObjectiveTargetId { get; init; }
    public string TimelineType { get; init; } = string.Empty;
    public DateOnly StartDate { get; init; }
    public DateOnly EndDate { get; init; }
    public decimal TargetValue { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
}
