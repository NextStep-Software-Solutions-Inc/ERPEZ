using System;
using System.Collections.Generic;

namespace ERPEZ.Application.Features.Procurement.Dashboard.Dtos;

public record ProcurementDashboardSummaryDto
{
    // ── KPIs ─────────────────────────────────────────────────────────────────
    public int TotalActivePRs { get; init; }
    public decimal TotalPRAmount { get; init; }
    public double ConsolidatedPRsRate { get; init; }  // 0-100%
    public int ActiveRFQs { get; init; }
    public int PendingBACResolutions { get; init; }
    public int TotalNOACount { get; init; }
    public decimal TotalNOAAmount { get; init; }
    public int TotalPOCount { get; init; }
    public decimal TotalPOValue { get; init; }
    public int ActiveContracts { get; init; }
    public int DirectContractingCount { get; init; }
    public decimal DirectContractingAmount { get; init; }
    public int DirectAcquisitionCount { get; init; }
    public decimal DirectAcquisitionAmount { get; init; }
    public int OverdueItemsCount { get; init; }
    public double AvgProcurementTatDays { get; init; }
    public double SavingsRate { get; init; }  // (ABC - Awarded) / ABC
    public double BudgetUtilizationRate { get; init; }  // POValue / AppBudget

    // ── Year-over-year deltas (% change; null if no prior year) ───────────
    public double? PRChangeYoY { get; init; }
    public double? ConsolidationChangeYoY { get; init; }
    public double? RFQChangeYoY { get; init; }
    public double? BACChangeYoY { get; init; }
    public double? POValueChangeYoY { get; init; }
    public double? ContractChangeYoY { get; init; }
    public double? SavingsRateChangeYoY { get; init; }

    // ── Pipeline funnel ───────────────────────────────────────────────────
    public PipelineStageSummary Requests { get; init; } = new();
    public PipelineStageSummary Bidding { get; init; } = new();
    public PipelineStageSummary Award { get; init; } = new();
    public PipelineStageSummary Ordering { get; init; } = new();
    public PipelineStageSummary DirectMethods { get; init; } = new();

    // ── Consolidation progress ────────────────────────────────────────────
    public ConsolidationProgressDto Consolidation { get; init; } = new();

    // ── Alerts (5 types) ──────────────────────────────────────────────────
    public int OverduePRCount { get; init; }
    public int RFQsClosingIn3Days { get; init; }
    public int PendingNTPCount { get; init; }
    public int StalledProcurementCount { get; init; }   // no activity 14+ days
    public bool BudgetNearLimit { get; init; }          // utilization > 90%
}

public record PipelineStageSummary
{
    public int TotalCount { get; init; }
    public List<SubItemSummary> SubItems { get; init; } = [];
}

public record SubItemSummary
{
    public string Label { get; init; } = string.Empty;
    public int Count { get; init; }
    public bool IsStalled { get; init; }
}

public record ConsolidationProgressDto
{
    public int Total { get; init; }
    public int Consolidated { get; init; }
    public int InProgress { get; init; }
    public int Pending { get; init; }
    public double Percent { get; init; }
    public int StalledPRs { get; init; }
}
