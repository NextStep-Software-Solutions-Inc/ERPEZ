using ERPEZ.Application.Features.Planning.WFPObjective.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Dtos;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Dtos;

/// <summary>
/// Detailed response for WFP Objective Target including nested expenditures, timelines, and parent objective.
/// </summary>
public record WFPObjectiveTargetDetailedResponse
{
    public Guid Id { get; init; }
    public string ActivityName { get; init; } = string.Empty;
    public string Indicator { get; init; } = string.Empty;
    public decimal Weight { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;

    /// <summary>
    /// Parent WFP Objective that this target belongs to.
    /// </summary>
    public WFPObjectiveResponse? WFPObjective { get; init; }

    /// <summary>
    /// Collection of expenditure line items for this target.
    /// </summary>
    public List<WFPObjectiveTargetExpenditureResponse> WFPObjectiveTargetExpenditures { get; init; } = [];

    /// <summary>
    /// Collection of timelines associated with this target.
    /// </summary>
    public List<WFPObjectiveTimelineResponse> WFPObjectiveTimelines { get; init; } = [];
}
