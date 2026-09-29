using System.Collections.Generic;

namespace ERPEZ.Application.Features.Procurement.Dashboard.Dtos;

public record ProcurementDashboardAnalyticsDto
{
    // 8 original chart datasets
    public List<MonthlyPRCountPoint> MonthlyPRCount { get; init; } = [];
    public List<MonthlyPOValuePoint> MonthlyPOValue { get; init; } = [];
    public List<ProcurementModeShare> ModeDistribution { get; init; } = [];
    public List<OfficeSpendingItem> TopSpendingOffices { get; init; } = [];
    public List<ContractStatusShare> ContractStatusDist { get; init; } = [];
    public List<SupplierConcentration> TopSuppliers { get; init; } = [];
    public List<MonthlyOverdueTrend> OverdueTrend { get; init; } = [];
    public List<TatBenchmarkItem> TatBenchmark { get; init; } = [];
    // 3 new chart datasets
    public List<AbcVsAwardedItem> AbcVsAwarded { get; init; } = [];
    public List<QuarterlyKpiPoint> QuarterlyKpiComparison { get; init; } = [];
    public List<QuarterlyModeShiftPoint> ModeShiftByQuarter { get; init; } = [];
    // YoY table
    public YearOverYearSummary YearOverYear { get; init; } = new();
}

public record MonthlyPRCountPoint
{
    public string Month { get; init; } = string.Empty;
    public int Draft { get; init; }
    public int Submitted { get; init; }
    public int Approved { get; init; }
}

public record MonthlyPOValuePoint
{
    public string Month { get; init; } = string.Empty;
    public decimal Value { get; init; }
}

public record ProcurementModeShare
{
    public string ModeName { get; init; } = string.Empty;
    public int Count { get; init; }
    public decimal Amount { get; init; }
    public double Percentage { get; init; }
}

public record OfficeSpendingItem
{
    public string OfficeName { get; init; } = string.Empty;
    public decimal Amount { get; init; }
    public int PRCount { get; init; }
}

public record ContractStatusShare
{
    public string Status { get; init; } = string.Empty;
    public int Count { get; init; }
    public double Percentage { get; init; }
}

public record SupplierConcentration
{
    public string SupplierName { get; init; } = string.Empty;
    public decimal TotalAwarded { get; init; }
    public int ContractCount { get; init; }
    public double Percentage { get; init; }
}

public record MonthlyOverdueTrend
{
    public string Month { get; init; } = string.Empty;
    public int OverduePRs { get; init; }
    public int OverdueRFQs { get; init; }
    public int OverdueNTPs { get; init; }
}

public record TatBenchmarkItem
{
    public string Stage { get; init; } = string.Empty;
    public double CurrentYearDays { get; init; }
    public double PriorYearDays { get; init; }
    public double TargetDays { get; init; }
}

public record AbcVsAwardedItem
{
    public string ProjectTitle { get; init; } = string.Empty;
    public decimal ABC { get; init; }
    public decimal AwardedAmount { get; init; }
}

public record QuarterlyKpiPoint
{
    public string Quarter { get; init; } = string.Empty;
    public int PRCount { get; init; }
    public int POCount { get; init; }
    public int ContractCount { get; init; }
    public decimal POValue { get; init; }
}

public record QuarterlyModeShiftPoint
{
    public string Quarter { get; init; } = string.Empty;
    public int BiddingCount { get; init; }
    public int ShoppingCount { get; init; }
    public int DirectCount { get; init; }
    public int OtherCount { get; init; }
}

public record YearOverYearSummary
{
    public int CurrentYear { get; init; }
    public int PriorYear { get; init; }
    public int CurrentYearPRCount { get; init; }
    public int PriorYearPRCount { get; init; }
    public decimal CurrentYearPOValue { get; init; }
    public decimal PriorYearPOValue { get; init; }
    public int CurrentYearContractCount { get; init; }
    public int PriorYearContractCount { get; init; }
    public double CurrentYearSavingsRate { get; init; }
    public double PriorYearSavingsRate { get; init; }
}
