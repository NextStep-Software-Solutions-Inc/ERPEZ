namespace ERPEZ.Application.Features.Planning.WFPObjective.Dtos;

public record UpdateWFPObjectiveRequest
{
    public string? Description { get; init; }
    public decimal? Weight { get; init; }
    public string? Outcome { get; init; }
}
