namespace ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Dtos;

/// <summary>
/// Represents a date range for timeline creation.
/// </summary>
public record TimelineDateRangeRequest
{
    public DateOnly StartDate { get; init; }
    public DateOnly EndDate { get; init; }
    public decimal Value { get; init; }
    public string TimelineType { get; init; } = string.Empty;
}
