namespace ERPEZ.Application.Features.Planning.WFPObjective.Dtos;

/// <summary>
/// Represents a single WFP Objective item for batch creation.
/// </summary>
public record CreateWFPObjectiveItemRequest
{
    public string Description { get; init; } = string.Empty;
    public decimal Weight { get; init; }
    public string? Outcome { get; init; }
    public List<CreateWFPObjectiveActivityItemRequest>? WFPObjectiveActivities { get; init; } = [];
}

public record CreateWFPObjectiveActivityItemRequest
{
    public string ActivityName { get; init; } = string.Empty;
    public string? Indicator { get; init; }
    public decimal Weight { get; init; }
    public Guid? OPCRActivityId { get; init; }
}
