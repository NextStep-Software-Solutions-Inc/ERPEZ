using ERPEZ.Application.Features.Planning.WFP.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjective.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjectiveActivityExpenditure.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Dtos;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveActivity.Dtos;

/// <summary>
/// Detailed response for WFP Objective Target including nested expenditures, timelines, and parent objective.
/// </summary>
public record WFPObjectiveActivityDetailedResponse
{
    public Guid Id { get; init; }
    public string ActivityName { get; init; } = string.Empty;
    public string Indicator { get; init; } = string.Empty;
    public decimal Weight { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    public string? WFPStatus { get; init; }

    /// <summary>
    /// Parent WFP that this activity belongs to.
    /// </summary>
    public WFPResponse? WFP { get; init; }

    /// <summary>
    /// Parent WFP Objective that this target belongs to.
    /// </summary>
    public WFPObjectiveResponse? WFPObjective { get; init; }

    /// <summary>
    /// Collection of expenditure line items for this target.
    /// </summary>
    public List<WFPObjectiveActivityExpenditureResponse> WFPObjectiveActivityExpenditures { get; init; } = [];

    /// <summary>
    /// Collection of timelines associated with this target.
    /// </summary>
    public List<WFPObjectiveTimelineResponse> WFPObjectiveTimelines { get; init; } = [];
}
