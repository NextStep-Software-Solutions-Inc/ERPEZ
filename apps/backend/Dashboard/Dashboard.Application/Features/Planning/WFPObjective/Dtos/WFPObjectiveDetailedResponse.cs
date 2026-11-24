using ERPEZ.Application.Features.Planning.WFP.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjectiveActivity.Dtos;

namespace ERPEZ.Application.Features.Planning.WFPObjective.Dtos;

/// <summary>
/// Detailed response for WFP Objective including nested targets, timelines, and budget requirements.
/// </summary>
public record WFPObjectiveDetailedResponse
{
    public Guid Id { get; init; }
    public string Description { get; init; } = string.Empty;
    public decimal Weight { get; init; }
    public string? Outcome { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    public List<WFPObjectiveActivityDetailedResponse> WFPObjectiveActivities { get; init; } = [];
    public WFPResponse? WFP { get; init; }
}
