using ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Dtos;

namespace ERPEZ.Application.Features.Planning.WFPObjective.Dtos;

/// <summary>
/// Detailed response for WFP Objective including nested targets, timelines, and budget requirements.
/// </summary>
public record WFPObjectiveDetailedResponse
{
    public Guid Id { get; init; }
    public Guid WFPId { get; init; }
    public string Description { get; init; } = string.Empty;
    public decimal Weight { get; init; }
    public string? Outcome { get; init; }
    public List<WFPObjectiveTargetDetailedResponse> WFPObjectiveTargets { get; init; } = [];
}

/// <summary>
/// Detailed response for WFP Objective Target with nested timelines and budget requirements.
/// </summary>
public record WFPObjectiveTargetDetailedResponse
{
    public Guid Id { get; init; }
    public string ActivityName { get; init; } = string.Empty;
    public string Indicator { get; init; } = string.Empty;
    public decimal Weight { get; init; }
    public List<WFPObjectiveTargetExpenditureResponse> WFPObjectiveTargetExpenditures { get; init; } = [];
    public List<WFPObjectiveTimelineResponse> WFPObjectiveTimelines { get; init; } = [];
}
