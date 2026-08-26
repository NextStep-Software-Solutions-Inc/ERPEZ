namespace ERPEZ.Application.Features.Dashboard.Dtos;

/// <summary>
/// Planning dashboard overview response with all key statistics.
/// </summary>
public record DashboardOverviewResponse
{
    /// <summary>
    /// KPI encoding statistics.
    /// </summary>
    public KPIStatistics KPIStats { get; init; } = new();

    /// <summary>
    /// OPCR submission statistics.
    /// </summary>
    public OPCRStatistics OPCRStats { get; init; } = new();

    /// <summary>
    /// Budget utilization statistics.
    /// </summary>
    public BudgetStatistics BudgetStats { get; init; } = new();

    /// <summary>
    /// PPMP consolidation statistics.
    /// </summary>
    public PPMPStatistics PPMPStats { get; init; } = new();

    /// <summary>
    /// OPCR commitment planned vs actual data for chart.
    /// </summary>
    public List<OPCRPlannedActual> OPCRCommitments { get; init; } = [];

    /// <summary>
    /// MFO reference status breakdown.
    /// </summary>
    public MFOReferenceSummary MFOStatus { get; init; } = new();

    /// <summary>
    /// KPI Library health metrics.
    /// </summary>
    public KPILibraryHealth KPILibraryHealth { get; init; } = new();

    /// <summary>
    /// Budget utilization heatmap data (monthly breakdown by department).
    /// </summary>
    public List<BudgetHeatmapData> BudgetUtilizationHeatmap { get; init; } = [];
}

/// <summary>
/// KPI encoding statistics.
/// </summary>
public record KPIStatistics
{
    /// <summary>
    /// Total number of KPIs encoded.
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
/// Budget utilization statistics.
/// </summary>
public record BudgetStatistics
{
    /// <summary>
    /// Total budget utilized in the base currency.
    /// </summary>
    public decimal UtilizedAmount { get; init; }

    /// <summary>
    /// Total budget planned for the fiscal year.
    /// </summary>
    public decimal PlannedAmount { get; init; }

    /// <summary>
    /// Utilization percentage (0-100+).
    /// </summary>
    public decimal UtilizationPercentage { get; init; }

    /// <summary>
    /// Currency code (e.g., "PHP", "USD").
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
    /// Number of PPMPs in progress.
    /// </summary>
    public int InProgressCount { get; init; }

    /// <summary>
    /// Total number of PPMPs.
    /// </summary>
    public int TotalPPMPs { get; init; }
}

/// <summary>
/// OPCR planned vs actual commitment data point for chart.
/// </summary>
public record OPCRPlannedActual
{
    /// <summary>
    /// Month label (e.g., "Jan", "Feb", "Mar").
    /// </summary>
    public string Month { get; init; } = string.Empty;

    /// <summary>
    /// Planned commitment amount for the month.
    /// </summary>
    public decimal PlannedAmount { get; init; }

    /// <summary>
    /// Actual commitment amount for the month.
    /// </summary>
    public decimal ActualAmount { get; init; }

    /// <summary>
    /// Variance (Actual - Planned).
    /// </summary>
    public decimal Variance { get; init; }
}

/// <summary>
/// MFO reference status summary.
/// </summary>
public record MFOReferenceSummary
{
    /// <summary>
    /// Total number of MFOs.
    /// </summary>
    public int TotalMFOs { get; init; }

    /// <summary>
    /// Number of completed MFOs.
    /// </summary>
    public int CompletedCount { get; init; }

    /// <summary>
    /// Number of ongoing MFOs.
    /// </summary>
    public int OngoingCount { get; init; }

    /// <summary>
    /// Number of pending MFOs.
    /// </summary>
    public int PendingCount { get; init; }

    /// <summary>
    /// Percentage of completed MFOs.
    /// </summary>
    public decimal CompletionPercentage { get; init; }
}

/// <summary>
/// KPI Library health metrics.
/// </summary>
public record KPILibraryHealth
{
    /// <summary>
    /// Percentage of active KPIs (0-100).
    /// </summary>
    public decimal ActivePercentage { get; init; }

    /// <summary>
    /// Percentage of pending KPIs (0-100).
    /// </summary>
    public decimal PendingPercentage { get; init; }

    /// <summary>
    /// Percentage of inactive KPIs (0-100).
    /// </summary>
    public decimal InactivePercentage { get; init; }

    /// <summary>
    /// Number of active KPIs.
    /// </summary>
    public int ActiveCount { get; init; }

    /// <summary>
    /// Number of pending KPIs.
    /// </summary>
    public int PendingCount { get; init; }

    /// <summary>
    /// Number of inactive KPIs.
    /// </summary>
    public int InactiveCount { get; init; }

    /// <summary>
    /// Total number of KPIs.
    /// </summary>
    public int TotalKPIs { get; init; }

    /// <summary>
    /// Health status: "Healthy" (>60% active), "Warning" (40-60%), "Critical" (<40%).
    /// </summary>
    public string HealthStatus { get; init; } = string.Empty;
}

/// <summary>
/// Budget utilization heatmap data for monthly breakdown.
/// </summary>
public record BudgetHeatmapData
{
    /// <summary>
    /// Department or office name.
    /// </summary>
    public string Department { get; init; } = string.Empty;

    /// <summary>
    /// Department or office ID.
    /// </summary>
    public Guid DepartmentId { get; init; }

    /// <summary>
    /// Monthly utilization percentages (index 0 = January, 11 = December).
    /// </summary>
    public List<decimal> MonthlyUtilization { get; init; } = [];

    /// <summary>
    /// Average utilization across all months.
    /// </summary>
    public decimal AverageUtilization { get; init; }
}
