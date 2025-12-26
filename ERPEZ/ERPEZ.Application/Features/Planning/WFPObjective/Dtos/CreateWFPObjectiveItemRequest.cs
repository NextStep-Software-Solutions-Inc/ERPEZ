namespace ERPEZ.Application.Features.Planning.WFPObjective.Dtos;

/// <summary>
/// Represents a single WFP Objective item for batch creation.
/// </summary>
public class CreateWFPObjectiveItemRequest
{
    public string Description { get; set; } = string.Empty;
    public decimal Weight { get; set; }
    public string? Outcome { get; set; }
}
