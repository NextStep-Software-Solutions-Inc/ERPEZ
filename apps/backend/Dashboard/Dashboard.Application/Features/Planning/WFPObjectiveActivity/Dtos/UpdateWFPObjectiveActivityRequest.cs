namespace ERPEZ.Application.Features.Planning.WFPObjectiveActivity.Dtos;

public record UpdateWFPObjectiveActivityRequest
{
    public string? ActivityName { get; init; }
    public string? Indicator { get; init; }
    public decimal? Weight { get; init; }
    public List<TimelineDateRangeRequest>? Dates { get; init; }
}
