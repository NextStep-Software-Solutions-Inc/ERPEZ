namespace ERPEZ.Application.Features.Procurement.Dashboard.Dtos;

public record ProcurementHealthScorecardDto
{
    public int HealthScore { get; init; }  // Composite 0–100
    public double BudgetUtilizationPct { get; init; }
    public double SavingsRatePct { get; init; }
    public double BidFailureRatePct { get; init; }
    public double ContractCompletionRatePct { get; init; }
    public double AppCoveragePct { get; init; }
    public double AvgBidCountPerRFQ { get; init; }
    public double ReopeningRatePct { get; init; }
    public double AvgBacResolutionTatDays { get; init; }
    public double AvgNoaIssuanceTatDays { get; init; }
    public double ContractExecutionRatePct { get; init; }
    public double SupplierConcentrationPct { get; init; }  // top 3 suppliers' award share

    // GPPB APCPI Pillar I: Legislative and Regulatory Framework
    public double ApcpiCompetitiveBiddingRate { get; init; }
    public double ApcpiAlternativeModesRate { get; init; }
    public double ApcpiThresholdComplianceRate { get; init; }

    // GPPB APCPI Pillar II: Agency Institutional Capacity
    public double ApcpiBacSecretariatEfficiencyScore { get; init; }
    public double ApcpiPlanningAdherenceScore { get; init; }

    // GPPB APCPI Pillar III: Procurement Operations and Market Interface
    public double ApcpiAverageBiddersPerProject { get; init; }
    public double ApcpiOpportunityPostingRate { get; init; }
    public double ApcpiTurnaroundEfficiencyScore { get; init; }

    // GPPB APCPI Pillar IV: Integrity and Transparency of Agency Procurement System
    public double ApcpiDisputeResolutionRate { get; init; }
    public double ApcpiObserverAttendanceRate { get; init; }
    public int ApcpiOverallComplianceLevel { get; init; } // 1: Low, 2: Moderate, 3: Substantial, 4: High
}
