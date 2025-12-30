namespace ERPEZ.Application.Features.Planning.WFPObjective.Dtos;

/// <summary>
/// Represents a single WFP Objective item for batch creation.
/// </summary>
public record CreateWFPObjectiveItemRequest
{
    public string Description { get; init; } = string.Empty;
    public decimal Weight { get; init; }
    public string? Outcome { get; init; }
}
