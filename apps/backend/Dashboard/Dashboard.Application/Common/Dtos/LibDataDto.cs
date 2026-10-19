using ERPEZ.Application.Common.Interfaces;

namespace ERPEZ.Application.Common.Dtos;

/// <summary>
/// Top-level DTO used by the LIB document renderers (PDF and Excel).
/// Covers all five sections of the Line Item Budget document.
/// </summary>
public record LibDataDto : IAgencyLetterheadAware
{
    public string?   ProcuringEntityName { get; set; }
    public string?   ProcuringEntityAddress { get; set; }
    public byte[]?   LogoBytes     { get; set; }

    public string    LIBNumber     { get; init; } = string.Empty;
    public string    OfficeName    { get; init; } = string.Empty;
    public string    FiscalYear    { get; init; } = string.Empty;
    public string    FundSource    { get; init; } = string.Empty;
    public string    Scope         { get; init; } = string.Empty;
    public string    SourceType    { get; init; } = string.Empty;
    public decimal   TotalBudget   { get; init; }
    public DateTime? EffectiveDate { get; init; }

    /// <summary>
    /// Section I — LINE ITEM BUDGET BY API (activity scope, OPCR-sourced).
    /// Grouped by activity → allotment class → account group → sub-account group → row.
    /// </summary>
    public List<LibApiGroupDto> ApiGroups { get; init; } = [];

    /// <summary>
    /// Section I — LINE ITEM BUDGET BY PROJECT (project scope, WFP-sourced).
    /// Flat allotment class sections with dynamic cross-year quarterly columns.
    /// Null when <see cref="Scope"/> is not "Project".
    /// </summary>
    public LibProjectScopeDto? ProjectScope { get; init; }

    /// <summary>Section II (legacy) — flat monthly expense groups (non-activity scope).</summary>
    public List<LibAllotmentGroupDto> MonthlyExpenseGroups { get; init; } = [];

    /// <summary>Section II — activity-level target groups with metadata and monthly rows.</summary>
    public List<LibTargetGroupDto> TargetGroups { get; init; } = [];

    /// <summary>Section III — SUMMARY BY ACCOUNT GROUP AND BY QUARTER.</summary>
    public List<LibAccountGroupSummaryDto> AccountGroupSummaries { get; init; } = [];

    /// <summary>Section IV — SUMMARY BY QUARTER (allotment class totals).</summary>
    public List<LibQuarterSummaryDto> QuarterSummaries { get; init; } = [];

    /// <summary>Section V — SUMMARY BY FUNDSOURCE.</summary>
    public LibFundSourceSummaryDto? FundSourceSummary { get; init; }

    public List<SignatoryDto> Signatories { get; init; } = [];
}

// ── Project Scope (WFP-sourced) ───────────────────────────────────────────────

/// <summary>
/// Root container for a project-scope LIB (WFPObjectiveActivity source).
/// Carries the WFP project header metadata plus dynamic quarterly column
/// definitions derived from <c>WFPObjectiveTimeline</c>, and the flat
/// allotment-class expense hierarchy (PS / MOOE / CO → rows).
/// </summary>
public record LibProjectScopeDto
{
    /// <summary>Full project title (from WFP.ProjectTitle).</summary>
    public string ProjectTitle { get; init; } = string.Empty;

    /// <summary>Name of the project owner / implementing office.</summary>
    public string ProjectOwner { get; init; } = string.Empty;

    /// <summary>Total proposed budget (from WFP.ProposedBudget).</summary>
    public decimal ProjectAmount { get; init; }

    /// <summary>
    /// Human-readable duration string, e.g. "Twelve (12) Months, plus 12 months support".
    /// Derived from WFPObjectiveTimeline StartDate/EndDate in the command handler.
    /// </summary>
    public string Duration { get; init; } = string.Empty;

    /// <summary>Earliest StartDate across all WFPObjectiveTimeline entries for this project.</summary>
    public DateOnly? ProjectStartDate { get; init; }

    /// <summary>Latest EndDate across all WFPObjectiveTimeline entries for this project.</summary>
    public DateOnly? ProjectEndDate { get; init; }

    /// <summary>
    /// Ordered list of year-quarter column slots for the document table header.
    /// Derived from the union of all WFPObjectiveTimeline StartDate/EndDate ranges,
    /// expanded into individual fiscal-year quarters.
    /// Example: [2025-Q1, 2025-Q2, 2025-Q3, 2025-Q4, 2026-Q1].
    /// </summary>
    public List<LibProjectQuarterColumnDto> Columns { get; init; } = [];

    /// <summary>
    /// Allotment class groups (PS / MOOE / Capital Outlay) each containing the
    /// account → sub-account → row hierarchy.
    /// Row amounts are stored positionally in <see cref="LibRowDto.QuarterAmounts"/>,
    /// aligned to <see cref="Columns"/> by index.
    /// </summary>
    public List<LibAllotmentGroupDto> AllotmentGroups { get; init; } = [];
}

/// <summary>
/// Defines a single year-quarter column in a project-scope LIB table.
/// The renderer uses <see cref="Year"/> and <see cref="QuarterNumber"/> to
/// group columns under a fiscal-year header row, and <see cref="Label"/> for
/// the individual column header cell (e.g. "1st Quarter").
/// </summary>
public record LibProjectQuarterColumnDto
{
    /// <summary>Calendar year of this column (e.g. 2025).</summary>
    public int Year { get; init; }

    /// <summary>Quarter number within the year: 1 = Jan–Mar, 2 = Apr–Jun, 3 = Jul–Sep, 4 = Oct–Dec.</summary>
    public int QuarterNumber { get; init; }

    /// <summary>Display label for the column header cell (e.g. "1st Quarter", "2nd Quarter").</summary>
    public string Label { get; init; } = string.Empty;
}

// ── Hierarchy DTOs (Sections I & II) ─────────────────────────────────────────

/// <summary>
/// Root grouping — one per Allotment Class (e.g. MOOE, PS, CO).
/// Used inside <see cref="LibApiGroupDto"/> (quarterly activity scope),
/// <see cref="LibTargetGroupDto"/> (monthly target scope), and
/// <see cref="LibProjectScopeDto"/> (dynamic quarterly project scope).
/// </summary>
public record LibAllotmentGroupDto
{
    public string                   AllotmentClass { get; init; } = string.Empty;
    public List<LibAccountGroupDto> AccountGroups  { get; init; } = [];
    public decimal                  SubTotal       { get; init; }
}

/// <summary>Mid-level — one per Account Group (e.g. "Communication Expenses").</summary>
public record LibAccountGroupDto
{
    public string                      AccountGroupName { get; init; } = string.Empty;
    public List<LibSubAccountGroupDto> SubGroups        { get; init; } = [];
    public decimal                     SubTotal         { get; init; }
}

/// <summary>
/// Optional sub-account group (e.g. "Office Supplies Expenses" under "Supplies and Materials").
/// <see cref="SubGroupName"/> is <c>null</c> when there is no sub-level; rows are flattened
/// directly under the account group in that case.
/// </summary>
public record LibSubAccountGroupDto
{
    public string?         SubGroupName { get; init; }
    public List<LibRowDto> Rows         { get; init; } = [];
    public decimal         SubTotal     { get; init; }
}

// ── Activity groupings ────────────────────────────────────────────────────────

/// <summary>Section I activity grouping (one per API / program / activity).</summary>
public record LibApiGroupDto
{
    public string                      ActivityName    { get; init; } = string.Empty;
    public string                      PrexcDynamicKra { get; init; } = string.Empty;
    public string                      GoalsOutcome    { get; init; } = string.Empty;
    public string                      ApiLabel        { get; init; } = string.Empty;
    public List<LibAllotmentGroupDto>  ExpenseGroups   { get; init; } = [];
    public decimal                     SubTotal        { get; init; }
}

/// <summary>Section II activity grouping (one per KPI / target group).</summary>
public record LibTargetGroupDto
{
    public string                      ActivityName    { get; init; } = string.Empty;
    public string                      PrexcDynamicKra { get; init; } = string.Empty;
    public string                      GoalsOutcome    { get; init; } = string.Empty;
    public string                      KpiLabel        { get; init; } = string.Empty;
    public List<string>                Targets         { get; init; } = [];
    public List<LibAllotmentGroupDto>  ExpenseGroups   { get; init; } = [];
    public decimal                     SubTotal        { get; init; }
}

// ── Row ───────────────────────────────────────────────────────────────────────

/// <summary>
/// One line item within a section table.
/// <para>
/// <b>Activity scope</b>: populate <see cref="Q1Budget"/>–<see cref="Q4Budget"/> and
/// leave <see cref="QuarterAmounts"/> empty.
/// </para>
/// <para>
/// <b>Project scope</b>: populate <see cref="QuarterAmounts"/> with amounts aligned
/// positionally to <see cref="LibProjectScopeDto.Columns"/>, and leave
/// <see cref="Q1Budget"/>–<see cref="Q4Budget"/> at zero.
/// </para>
/// <para>
/// <b>Monthly (legacy)</b>: populate <see cref="JanBudget"/>–<see cref="DecBudget"/>.
/// </para>
/// </summary>
public record LibRowDto
{
    public string  UACSCode    { get; init; } = string.Empty;
    public string  ObjectName  { get; init; } = string.Empty;
    public string? Description { get; init; }

    // ── Activity scope: fixed fiscal-year quarters ────────────────────────────
    public decimal Q1Budget  { get; init; }
    public decimal Q2Budget  { get; init; }
    public decimal Q3Budget  { get; init; }
    public decimal Q4Budget  { get; init; }

    // ── Project scope: dynamic cross-year quarterly amounts ───────────────────
    /// <summary>
    /// Ordered list of quarterly budget amounts for project-scope rows.
    /// Each index corresponds to the matching index in
    /// <see cref="LibProjectScopeDto.Columns"/>.
    /// Empty for activity-scope and monthly-scope rows.
    /// </summary>
    public List<decimal> QuarterAmounts { get; init; } = [];

    // ── Monthly (legacy) scope ────────────────────────────────────────────────
    public decimal JanBudget { get; init; }
    public decimal FebBudget { get; init; }
    public decimal MarBudget { get; init; }
    public decimal AprBudget { get; init; }
    public decimal MayBudget { get; init; }
    public decimal JunBudget { get; init; }
    public decimal JulBudget { get; init; }
    public decimal AugBudget { get; init; }
    public decimal SepBudget { get; init; }
    public decimal OctBudget { get; init; }
    public decimal NovBudget { get; init; }
    public decimal DecBudget { get; init; }

    public decimal TotalBudget { get; init; }
}

// ── Summary DTOs (Sections III–V) ────────────────────────────────────────────

/// <summary>Section III — one entry per allotment class with per-account-group quarterly breakdown.</summary>
public record LibAccountGroupSummaryDto
{
    public string                      ExpenseClassType { get; init; } = string.Empty;
    public string                      ExpenseClassName { get; init; } = string.Empty;
    public List<LibAccountGroupRowDto> Rows             { get; init; } = [];
    public decimal                     Q1Budget         { get; init; }
    public decimal                     Q2Budget         { get; init; }
    public decimal                     Q3Budget         { get; init; }
    public decimal                     Q4Budget         { get; init; }
    public decimal                     TotalBudget      { get; init; }
}

public record LibAccountGroupRowDto
{
    public string  AccountGroupName { get; init; } = string.Empty;
    public decimal Q1Budget         { get; init; }
    public decimal Q2Budget         { get; init; }
    public decimal Q3Budget         { get; init; }
    public decimal Q4Budget         { get; init; }
    public decimal TotalBudget      { get; init; }
}

/// <summary>Section IV — one row per allotment class with quarterly totals.</summary>
public record LibQuarterSummaryDto
{
    public string  AllotmentClass { get; init; } = string.Empty;
    public decimal Q1Budget       { get; init; }
    public decimal Q2Budget       { get; init; }
    public decimal Q3Budget       { get; init; }
    public decimal Q4Budget       { get; init; }
    public decimal TotalBudget    { get; init; }
}

/// <summary>Section V — fund source totals.</summary>
public record LibFundSourceSummaryDto
{
    public string                             FundSource    { get; init; } = string.Empty;
    public List<LibFundSourceAccountGroupDto> AccountGroups { get; init; } = [];
    public decimal                            Q1Budget      { get; init; }
    public decimal                            Q2Budget      { get; init; }
    public decimal                            Q3Budget      { get; init; }
    public decimal                            Q4Budget      { get; init; }
    public decimal                            TotalBudget   { get; init; }
}

public record LibFundSourceAccountGroupDto
{
    public string  AllotmentClass   { get; init; } = string.Empty;
    public string  AccountGroupName { get; init; } = string.Empty;
    public decimal Amount           { get; init; }
}
