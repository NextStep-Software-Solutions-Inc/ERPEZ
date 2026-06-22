// ERPEZ.Application/Common/Dtos/LibDataDto.cs
namespace ERPEZ.Application.Common.Dtos;

/// <summary>
/// Top-level DTO passed to LibPdfRenderer for generating the FM-USTP-FDP-01 form.
/// Covers all five sections of the Line Item Budget document.
/// </summary>
public record LibDataDto
{
    public string    LIBNumber     { get; init; } = string.Empty;
    public string    OfficeName    { get; init; } = string.Empty;
    public string    FiscalYear    { get; init; } = string.Empty;
    public string    FundSource    { get; init; } = string.Empty;
    public string    Scope         { get; init; } = string.Empty;
    public string    SourceType    { get; init; } = string.Empty;
    public decimal   TotalBudget   { get; init; }
    public DateTime? EffectiveDate { get; init; }

    /// <summary>Section I — LINE ITEM BUDGET BY API (grouped by activity → allotment class → account group → object).</summary>
    public List<LibApiGroupDto> ApiGroups { get; init; } = [];

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

// ── Hierarchy DTOs (Sections I & II) ─────────────────────────────────────────

/// <summary>
/// Root grouping — one per Allotment Class (e.g. MOOE, PS, CO).
/// Used inside both LibApiGroupDto (quarterly) and LibTargetGroupDto (monthly).
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

/// <summary>One line item within a section table.</summary>
public record LibRowDto
{
    public string  UACSCode    { get; init; } = string.Empty;
    public string  ObjectName  { get; init; } = string.Empty;
    public string? Description { get; init; }

    // Quarterly values (Section I)
    public decimal Q1Budget  { get; init; }
    public decimal Q2Budget  { get; init; }
    public decimal Q3Budget  { get; init; }
    public decimal Q4Budget  { get; init; }

    // Monthly values (Section II)
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
