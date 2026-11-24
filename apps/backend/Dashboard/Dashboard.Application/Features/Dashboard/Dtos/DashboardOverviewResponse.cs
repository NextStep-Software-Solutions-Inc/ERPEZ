namespace ERPEZ.Application.Features.Dashboard.Dtos;

/// <summary>
/// Overview response containing all planning dashboard statistics.
/// </summary>
public record DashboardOverviewResponse
{
    /// <summary>
    /// KPI Statistics (Total Encoded, Encoded This Month, MoM Change).
    /// </summary>
    public KPIStatistics KPIStats { get; init; } = new();

    /// <summary>
    /// OPCR Statistics (Total, Submitted, Pending, Submitted Percentage).
    /// </summary>
    public OPCRStatistics OPCRStats { get; init; } = new();

    /// <summary>
    /// Budget Statistics (Planned/Ceiling Amount, Programmed Amount, Programming Percentage).
    /// </summary>
    public BudgetStatistics BudgetStats { get; init; } = new();

    /// <summary>
    /// PPMP Statistics (Total, Consolidated, In Progress, Pending).
    /// </summary>
    public PPMPStatistics PPMPStats { get; init; } = new();

    /// <summary>
    /// Quarterly OPCR Planned Target vs Actual Accomplishment (Q1..Q4).
    /// </summary>
    public List<OPCRPlannedActual> OPCRCommitments { get; init; } = [];

    /// <summary>
    /// Department Programmed Budget vs Approved Ceiling Distribution.
    /// </summary>
    public List<DepartmentBudgetDistributionDto> DepartmentBudgetDistribution { get; init; } = [];

    /// <summary>
    /// Expense Class Allocation Summary (PS, MOOE, CO, FE).
    /// </summary>
    public ExpenseClassAllocationSummary ExpenseClassAllocation { get; init; } = new();

    /// <summary>
    /// APP Procurement Readiness Summary.
    /// </summary>
    public APPProcurementReadinessSummary APPProcurementReadiness { get; init; } = new();

    /// <summary>
    /// KPI Classification Summary (Strategic, Core, Support).
    /// </summary>
    public KPIClassificationSummary KPIClassification { get; init; } = new();
}

/// <summary>
/// KPI encoding statistics.
/// </summary>
public record KPIStatistics
{
    /// <summary>
    /// Total number of KPIs encoded for the selected fiscal year.
    /// </summary>
    public int TotalKPIsEncoded { get; init; }

    /// <summary>
    /// Number of KPIs encoded this month.
    /// </summary>
    public int EncodedThisMonth { get; init; }

    /// <summary>
    /// Percentage change from previous month (can be negative).
    /// </summary>
    public decimal MonthOverMonthChange { get; init; }
}

/// <summary>
/// OPCR submission statistics.
/// </summary>
public record OPCRStatistics
{
    /// <summary>
    /// Percentage of OPCRs submitted (0-100).
    /// </summary>
    public decimal SubmittedPercentage { get; init; }

    /// <summary>
    /// Number of OPCRs pending submission or approval.
    /// </summary>
    public int PendingCount { get; init; }

    /// <summary>
    /// Total number of OPCRs for the fiscal year.
    /// </summary>
    public int TotalOPCRs { get; init; }

    /// <summary>
    /// Number of OPCRs submitted.
    /// </summary>
    public int SubmittedCount { get; init; }
}

/// <summary>
/// Budget programming vs ceiling statistics in Planning domain.
/// </summary>
public record BudgetStatistics
{
    /// <summary>
    /// Total budget programmed across line item budgets.
    /// </summary>
    public decimal UtilizedAmount { get; init; }

    /// <summary>
    /// Total budget planned / approved ceiling for the fiscal year.
    /// </summary>
    public decimal PlannedAmount { get; init; }

    /// <summary>
    /// Programming percentage (0-100+).
    /// </summary>
    public decimal UtilizationPercentage { get; init; }

    /// <summary>
    /// Currency code (e.g., "PHP").
    /// </summary>
    public string Currency { get; init; } = "PHP";
}

/// <summary>
/// PPMP consolidation statistics.
/// </summary>
public record PPMPStatistics
{
    /// <summary>
    /// Percentage of PPMPs consolidated (0-100).
    /// </summary>
    public decimal ConsolidatedPercentage { get; init; }

    /// <summary>
    /// Number of pending PPMP items.
    /// </summary>
    public int PendingItemsCount { get; init; }

    /// <summary>
    /// Number of consolidated PPMPs.
    /// </summary>
    public int ConsolidatedCount { get; init; }

    /// <summary>
    /// Number of PPMPs in progress / submitted.
    /// </summary>
    public int InProgressCount { get; init; }

    /// <summary>
    /// Total number of PPMPs.
    /// </summary>
    public int TotalPPMPs { get; init; }
}

/// <summary>
/// Quarterly OPCR planned target baseline vs actual accomplishment data point for chart.
/// </summary>
public record OPCRPlannedActual
{
    /// <summary>
    /// Period / Quarter label (e.g., "Q1", "Q2", "Q3", "Q4").
    /// </summary>
    public string Month { get; init; } = string.Empty;

    /// <summary>
    /// Planned target baseline rate (100%) when targets exist, or 0% when no targets.
    /// </summary>
    public decimal PlannedAmount { get; init; }

    /// <summary>
    /// Actual accomplished rate (%) calculated as (Total Actual / Total Target) * 100.
    /// </summary>
    public decimal ActualAmount { get; init; }

    /// <summary>
    /// Variance (Actual - Planned).
    /// </summary>
    public decimal Variance { get; init; }

    /// <summary>
    /// Indicates whether physical targets are encoded for this quarter.
    /// </summary>
    public bool HasData { get; init; }

    /// <summary>
    /// Indicates whether actual accomplishment has been reported for this quarter.
    /// </summary>
    public bool HasAccomplishmentReported { get; init; }
}

/// <summary>
/// Department Programmed Budget vs Approved Ceiling comparison.
/// </summary>
public record DepartmentBudgetDistributionDto
{
    public string Department { get; init; } = string.Empty;
    public Guid DepartmentId { get; init; }
    public decimal ProgrammedAmount { get; init; }
    public decimal CeilingAmount { get; init; }
    public decimal ProgrammingPercentage { get; init; }
    public bool HasCeilingAllocated { get; init; }
    public string Status { get; init; } = "On Track"; // "On Track", "Approaching Ceiling", "Over-Programmed", "No Ceiling Allocated"
    public List<decimal> QuarterlyProgrammed { get; init; } = [];
}

/// <summary>
/// Expense class allocation summary (PS, MOOE, CO, FE).
/// </summary>
public record ExpenseClassAllocationSummary
{
    public string Quarter { get; init; } = "All";
    public int Year { get; init; }
    public decimal TotalProgrammed { get; init; }
    public decimal TotalAllotment { get; init; }
    public decimal OverallProgrammingPercentage { get; init; }
    public List<ExpenseClassRowDto> Rows { get; init; } = [];
    public List<ExpenseClassDepartmentComparisonDto> BarChartData { get; init; } = [];
}

public record ExpenseClassRowDto
{
    public string Code { get; init; } = string.Empty;
    public string Label { get; init; } = string.Empty;
    public decimal ObligationPercent { get; init; } // Programming percentage
    public decimal ProgrammedAmount { get; init; }
    public decimal AllotmentAmount { get; init; }
    public string AllotmentLabel { get; init; } = string.Empty;
    public string Status { get; init; } = "On Track"; // "On Track", "Warning", "Over-Programmed", "No Allotment"
    public string Color { get; init; } = string.Empty;
}

public record ExpenseClassDepartmentComparisonDto
{
    public string Department { get; init; } = string.Empty;
    public Guid DepartmentId { get; init; }
    public decimal Obligated { get; init; } // Programmed budget in Planning domain
    public decimal Allotment { get; init; } // Allocated ceiling in Planning domain
}

/// <summary>
/// APP procurement readiness summary.
/// </summary>
public record APPProcurementReadinessSummary
{
    public string OverallStatus { get; init; } = "on-track";
    public int TotalItems { get; init; }
    public int ModeAssignedCount { get; init; }
    public int FullyEncodedCount { get; init; }
    public int ScheduledCount { get; init; }
    public int MissingScheduleCount { get; init; }
    public int EpaCount { get; init; }
    public decimal TotalEstimatedBudget { get; init; }
    public List<ProcurementReadinessStageDto> Stages { get; init; } = [];
    public List<ProcurementModeReadinessDto> ByMode { get; init; } = [];
}

public record ProcurementReadinessStageDto
{
    public string StageKey { get; init; } = string.Empty;
    public string Label { get; init; } = string.Empty;
    public int CompletedCount { get; init; }
    public int TotalCount { get; init; }
    public decimal Percent { get; init; }
    public string Color { get; init; } = string.Empty;
    public string Status { get; init; } = "complete"; // "complete", "in-progress", "action-needed"
    public string? ActionLabel { get; init; }
}

public record ProcurementModeReadinessDto
{
    public string Mode { get; init; } = string.Empty;
    public Guid? ModeId { get; init; }
    public int Count { get; init; }
    public decimal TotalAmount { get; init; }
    public decimal Percent { get; init; }
    public string Color { get; init; } = string.Empty;
}

/// <summary>
/// KPI classification summary (Strategic, Core, Support).
/// </summary>
public record KPIClassificationSummary
{
    public int Total { get; init; }
    public int FiscalYear { get; init; }
    public List<KPIClassificationItemDto> Items { get; init; } = [];
}

public record KPIClassificationItemDto
{
    public string Type { get; init; } = string.Empty; // "strategic" | "core" | "support"
    public string Label { get; init; } = string.Empty;
    public int Count { get; init; }
    public decimal Percent { get; init; }
    public string Description { get; init; } = string.Empty;
    public string Color { get; init; } = string.Empty;
    public int ActiveCount { get; init; }
    public List<KPIClassificationDivisionDto> Divisions { get; init; } = [];
}

public record KPIClassificationDivisionDto
{
    public string Name { get; init; } = string.Empty;
    public Guid? OfficeId { get; init; }
    public int Count { get; init; }
    public decimal SharePercentage { get; init; }
}
