namespace ERPEZ.Application.Features.Planning.Budgeting.BudgetAllocation.Dtos;

public record BudgetAllocationResponse
{
    public Guid Id { get; init; }
    public Guid LineItemBudgetDetailId { get; init; }
    public string BudgetPeriod { get; init; } = string.Empty;
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public decimal TotalAllocated { get; init; }
    public BudgetAllocationLineItemDetailResponse? LineItemBudgetDetail { get; init; }
}

public record BudgetAllocationLineItemDetailResponse
{
    public Guid Id { get; init; }
    public string? Description { get; init; }
    public decimal Budget { get; init; }
}

public record CreateBudgetAllocationRequest
{
    public Guid LineItemBudgetDetailId { get; init; }
    public string BudgetPeriod { get; init; } = string.Empty;
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public decimal TotalAllocated { get; init; }
}

public record UpdateBudgetAllocationRequest
{
    public Guid LineItemBudgetDetailId { get; init; }
    public string BudgetPeriod { get; init; } = string.Empty;
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public decimal TotalAllocated { get; init; }
}
