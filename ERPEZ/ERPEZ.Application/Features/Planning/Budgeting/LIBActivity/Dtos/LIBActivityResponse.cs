namespace ERPEZ.Application.Features.Planning.Budgeting.LIBActivity.Dtos;

public record LIBActivityResponse
{
    public Guid Id { get; init; }
    public Guid LineItemBudgetId { get; init; }
    public Guid? WFPObjectiveActivityId { get; init; }
    public Guid? OPCRActivityId { get; init; }
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
    public Guid Id { get; init; }
    public Guid LineItemBudgetId { get; init; }
    public Guid? WFPObjectiveActivityId { get; init; }
    public Guid? OPCRActivityId { get; init; }
    public string Name { get; init; } = string.Empty;
}