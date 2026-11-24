namespace ERPEZ.Application.Features.Planning.Document.Dtos;

/// <summary>
/// One row in the Work Plan table, sourced from a single WFPObjectiveActivity.
/// </summary>
public record WfpActivityDto
{
    /// <summary>Reserved for future grouping support (e.g. "Data Gathering:").
    /// Always null in this version — no source field exists on WFPObjectiveActivity yet.</summary>
    public string? GroupHeader { get; init; }

    /// <summary>TARGET ACTIVITIES cell. Maps from WFPObjectiveActivity.ActivityName.</summary>
    public string TargetActivity { get; init; } = string.Empty;

    /// <summary>TARGET ACCOMPLISHMENTS cell, e.g. "100% of Personnel Hired and deployed(1%)".
    /// Built from WFPObjectiveActivity.Indicator + Weight in the handler.</summary>
    public string TargetAccomplishment { get; init; } = string.Empty;

    // ── Quarterly % cells — pre-formatted strings, e.g. "60%". Null/empty if no
    // timeline falls in that quarter for this activity. ──────────────────────
    public string? Q1 { get; init; }
    public string? Q2 { get; init; }
    public string? Q3 { get; init; }
    public string? Q4 { get; init; }

    /// <summary>Row total across quarters, formatted, e.g. "100.00%".
    /// Sum of all WFPObjectiveTimeline.TargetValue for this activity.</summary>
    public string Total { get; init; } = string.Empty;

    /// <summary>Weighted % Total column, formatted, e.g. "1.00%".
    /// Sourced directly from WFPObjectiveActivity.Weight.</summary>
    public string WeightedPctTotal { get; init; } = string.Empty;
}
