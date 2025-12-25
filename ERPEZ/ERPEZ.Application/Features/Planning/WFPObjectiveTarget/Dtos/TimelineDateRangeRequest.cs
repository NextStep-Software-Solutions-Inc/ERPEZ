namespace ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Dtos;

/// <summary>
/// Represents a date range for timeline creation.
/// </summary>
public class TimelineDateRangeRequest
{
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
}
