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
}
