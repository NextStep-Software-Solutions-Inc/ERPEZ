namespace ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Dtos;

public class WFPObjectiveTimelineResponse
{
    public Guid Id { get; set; }
    public Guid WFPObjectiveTargetId { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public decimal TargetValue { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
}
