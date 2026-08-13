namespace ERPEZ.Application.Features.Planning.Document.Dtos;

/// <summary>
/// One Objective section in the Work Plan document (OBJECTIVES column).
/// Maps from WFPObjective. Orphan activities (WFPObjectiveId == null, path 1b)
/// are grouped under a synthetic objective with ObjectiveText = string.Empty
/// and Weight = 0 (built in the handler, not a real WFPObjective row).
/// </summary>
public record WfpObjectiveDto
{
    /// <summary>Display text for the OBJECTIVES cell, e.g.
    /// "1. To conduct mapping activities on CMTS... (34%)".
    /// Built in the handler from WFPObjective.Description + Weight.</summary>
    public string ObjectiveText { get; init; } = string.Empty;

    /// <summary>WFPObjective.Weight, kept numeric alongside the formatted ObjectiveText.</summary>
    public decimal Weight { get; init; }

    /// <summary>Ordered rows under this objective. GroupHeader rows are not populated
    /// in this pass (no source field exists yet on WFPObjectiveActivity) — every
    /// entry here is a real activity row.</summary>
    public List<WfpActivityDto> Activities { get; init; } = [];
}
