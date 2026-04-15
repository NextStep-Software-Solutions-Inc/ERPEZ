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
    public int DetailCount { get; init; }
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