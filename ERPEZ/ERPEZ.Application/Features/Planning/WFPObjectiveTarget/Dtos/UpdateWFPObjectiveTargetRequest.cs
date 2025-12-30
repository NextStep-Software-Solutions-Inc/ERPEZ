namespace ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Dtos;

public record UpdateWFPObjectiveTargetRequest
{
    public string? ActivityName { get; init; }
    public string? Indicator { get; init; }
    public decimal? Weight { get; init; }
}
