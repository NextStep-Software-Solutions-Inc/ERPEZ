namespace ERPEZ.Application.Features.Procurement.Dashboard.Dtos;

public record BudgetBurnAnalyticsDto
{
    public decimal ApprovedAppBudget { get; init; }
    public decimal TotalCommittedContracts { get; init; }
    public decimal TotalPendingCommitments { get; init; }
    public decimal UnencumberedBalance { get; init; }
    public double BudgetBurnPercentage { get; init; }
    public int UnprogrammedPRCount { get; init; }
    public decimal UnprogrammedPRTotalAmount { get; init; }
    public int BudgetOverrunPRCount { get; init; }
}
