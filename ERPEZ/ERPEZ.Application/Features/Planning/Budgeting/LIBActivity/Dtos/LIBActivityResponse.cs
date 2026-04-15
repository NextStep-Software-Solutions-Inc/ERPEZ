namespace ERPEZ.Application.Features.Planning.Budgeting.LIBActivity.Dtos;

public record LIBActivityResponse
{
    public Guid Id { get; init; }
    public Guid LineItemBudgetId { get; init; }
    public Guid? WFPObjectiveActivityId { get; init; }
    public Guid? OPCRActivityId { get; init; }
    public string Name { get; init; } = string.Empty;
    public LIBActivityLineItemBudgetResponse? LineItemBudget { get; init; }
    public LIBActivityWFPResponse? WFPObjectiveActivity { get; init; }
    public LIBActivityOPCRResponse? OPCRActivity { get; init; }
    public List<LIBActivityNestedDetailResponse> Details { get; init; } = [];
}

public record LIBActivityNestedDetailResponse
{
    public Guid Id { get; init; }
    public Guid ObjectId { get; init; }
    public string? ObjectName { get; init; }
    public string? ObjectCode { get; init; }
    public Guid? ExpenseClassId { get; init; }
    public string? ExpenseClassName { get; init; }
    public string? ExpenseClassType { get; init; }
    public Guid? WFPObjectiveActivityExpenditureId { get; init; }
    public string? Description { get; init; }
    public decimal? UnitQuantity { get; init; }
    public decimal? UnitCost { get; init; }
    public string? TimelineType { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public decimal Budget { get; init; }
    public List<LIBActivityNestedAllocationResponse> BudgetAllocations { get; init; } = [];
}

public record LIBActivityNestedAllocationResponse
{
    public Guid Id { get; init; }
    public string BudgetPeriod { get; init; } = string.Empty;
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public decimal TotalAllocated { get; init; }
}

public record LIBActivityLineItemBudgetResponse
{
    public Guid Id { get; init; }
    public string LIBNumber { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
}

public record LIBActivityWFPResponse
{
    public Guid Id { get; init; }
    public string ActivityName { get; init; } = string.Empty;
}

public record LIBActivityOPCRResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
}

public record CreateLIBActivityRequest
{
    public Guid LineItemBudgetId { get; init; }
    public Guid? WFPObjectiveActivityId { get; init; }
    public Guid? OPCRActivityId { get; init; }
    public string Name { get; init; } = string.Empty;
}

public record UpdateLIBActivityRequest
{
    public Guid LineItemBudgetId { get; init; }
    public Guid? WFPObjectiveActivityId { get; init; }
    public Guid? OPCRActivityId { get; init; }
    public string Name { get; init; } = string.Empty;
}