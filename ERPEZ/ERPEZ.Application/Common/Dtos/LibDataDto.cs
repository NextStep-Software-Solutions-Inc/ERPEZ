// ERPEZ.Application/Common/Dtos/LibDataDto.cs
namespace ERPEZ.Application.Common.Dtos;

/// <summary>
/// Top-level DTO passed to LibPdfRenderer for generating the FM-USTP-FDP-01 form.
/// Covers all five sections of the Line Item Budget document.
/// </summary>
public record LibDataDto
{
    public string  LIBNumber   { get; init; } = string.Empty;
    public string  OfficeName  { get; init; } = string.Empty;
    public string  FiscalYear  { get; init; } = string.Empty;
    public string  FundCluster { get; init; } = string.Empty;
    public string  Scope       { get; init; } = string.Empty;
    public string  SourceType  { get; init; } = string.Empty;
    public decimal TotalBudget { get; init; }

    /// <summary>Section I — LINE ITEM BUDGET BY API (grouped by activity → expense class).</summary>
    public List<LibApiGroupDto>            ApiGroups            { get; init; } = [];

    /// <summary>Section II — LINE ITEM BUDGET BY TARGET (expense class → object, monthly columns).</summary>
    public List<LibExpenseGroupDto>        MonthlyExpenseGroups { get; init; } = [];

    /// <summary>Section II — activity-level target groups with metadata and monthly rows.</summary>
    public List<LibTargetGroupDto>         TargetGroups         { get; init; } = [];

    /// <summary>Section III — SUMMARY BY ACCOUNT GROUP AND BY QUARTER.</summary>
    public List<LibAccountGroupSummaryDto> AccountGroupSummaries { get; init; } = [];

    /// <summary>Section IV — SUMMARY BY QUARTER (allotment class totals).</summary>
    public List<LibQuarterSummaryDto>      QuarterSummaries      { get; init; } = [];

    /// <summary>Section V — SUMMARY BY FUNDSOURCE.</summary>
    public LibFundSourceSummaryDto?        FundSourceSummary    { get; init; }

    public List<SignatoryDto>              Signatories          { get; init; } = [];
}

/// <summary>Section I activity grouping (one per API / program / activity).</summary>
public record LibApiGroupDto
{
    public string                   ActivityName     { get; init; } = string.Empty;
    public string                   PrexcDynamicKra  { get; init; } = string.Empty;
    public string                   GoalsOutcome     { get; init; } = string.Empty;
    public string                   ApiLabel         { get; init; } = string.Empty;
    public string                   NepGaaLabel      { get; init; } = string.Empty;
    public List<LibExpenseGroupDto> ExpenseGroups { get; init; } = [];
    public decimal                  SubTotal         { get; init; }
}

public record LibTargetGroupDto
{
    public string                   ActivityName    { get; init; } = string.Empty;
    public string                   PrexcDynamicKra { get; init; } = string.Empty;
    public string                   GoalsOutcome    { get; init; } = string.Empty;
    public string                   KpiLabel        { get; init; } = string.Empty;
    public string                   NepGaaLabel     { get; init; } = string.Empty;
    public List<string>             Targets         { get; init; } = [];
    public List<LibExpenseGroupDto> ExpenseGroups   { get; init; } = [];
    public decimal                  SubTotal        { get; init; }
}

/// <summary>
/// Expense-class sub-group used in both Section I (quarterly columns)
/// and Section II (monthly columns).
/// </summary>
public record LibExpenseGroupDto
{
    /// <summary>Full expense class name, e.g. "Maintenance and Other Operating Expenses (MOOE)".</summary>
    public string         ExpenseClassName { get; init; } = string.Empty;

    /// <summary>Short type code, e.g. "MOOE", "PS", "CO".</summary>
    public string         ExpenseClassType { get; init; } = string.Empty;

    public List<LibRowDto> Rows            { get; init; } = [];
    public decimal         SubTotal        { get; init; }
}

/// <summary>One line item within a section table.</summary>
public record LibRowDto
{
    public string  UACSCode    { get; init; } = string.Empty;
    public string  ObjectName  { get; init; } = string.Empty;
    public string? Description { get; init; }

    // ── Quarterly values (Section I) ─────────────────────────────────────────
    public decimal Q1Budget    { get; init; }
    public decimal Q2Budget    { get; init; }
    public decimal Q3Budget    { get; init; }
    public decimal Q4Budget    { get; init; }

    // ── Monthly values (Section II) ──────────────────────────────────────────
    public decimal JanBudget   { get; init; }
    public decimal FebBudget   { get; init; }
    public decimal MarBudget   { get; init; }
    public decimal AprBudget   { get; init; }
    public decimal MayBudget   { get; init; }
    public decimal JunBudget   { get; init; }
    public decimal JulBudget   { get; init; }
    public decimal AugBudget   { get; init; }
    public decimal SepBudget   { get; init; }
    public decimal OctBudget   { get; init; }
    public decimal NovBudget   { get; init; }
    public decimal DecBudget   { get; init; }

    public decimal TotalBudget { get; init; }
}

/// <summary>Section III — one row per expense class type with quarterly breakdown.</summary>
public record LibAccountGroupSummaryDto
{
    public string  ExpenseClassType { get; init; } = string.Empty;
    public string  ExpenseClassName { get; init; } = string.Empty;
    public List<LibAccountGroupRowDto> Rows { get; init; } = [];
    public decimal Q1Budget         { get; init; }
    public decimal Q2Budget         { get; init; }
    public decimal Q3Budget         { get; init; }
    public decimal Q4Budget         { get; init; }
    public decimal TotalBudget      { get; init; }
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
    public string  FundSource  { get; init; } = string.Empty;
    public List<LibFundSourceAccountGroupDto> AccountGroups { get; init; } = [];
    public decimal Q1Budget    { get; init; }
    public decimal Q2Budget    { get; init; }
    public decimal Q3Budget    { get; init; }
    public decimal Q4Budget    { get; init; }
    public decimal TotalBudget { get; init; }
}

public record LibFundSourceAccountGroupDto
{
    public string  AllotmentClass  { get; init; } = string.Empty;
    public string  AccountGroupName { get; init; } = string.Empty;
    public decimal Amount           { get; init; }
}
