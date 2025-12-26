using ERPEZ.Application.Features.Planning.ActivityBudgetRequirement.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Dtos;

namespace ERPEZ.Application.Features.Planning.WFPObjective.Dtos;

/// <summary>
/// Detailed response for WFP Objective including nested targets, timelines, and budget requirements.
/// </summary>
public class WFPObjectiveDetailedResponse
{
    public Guid Id { get; set; }
    public Guid WFPId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Weight { get; set; }
    public string? Outcome { get; set; }
    public List<WFPObjectiveTargetDetailedResponse> WFPObjectiveTargets { get; set; } = [];
}

/// <summary>
/// Detailed response for WFP Objective Target with nested timelines and budget requirements.
/// </summary>
public class WFPObjectiveTargetDetailedResponse
{
    public Guid Id { get; set; }
    public string ActivityName { get; set; } = string.Empty;
    public string Indicator { get; set; } = string.Empty;
    public decimal Weight { get; set; }
    public List<ActivityBudgetRequirementResponse> ActivityBudgetRequirements { get; set; } = [];
    public List<WFPObjectiveTimelineResponse> WFPObjectiveTimelines { get; set; } = [];
}
