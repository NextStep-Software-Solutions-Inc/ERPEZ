namespace ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Dtos;

public record LineItemBudgetDetailResponse
{
    public Guid Id { get; init; }
    public Guid LineItemBudgetId { get; init; }
    public Guid? LineItemBudgetActivityId { get; init; }
    public Guid? WFPObjectiveActivityExpenditureId { get; init; }
    public Guid ObjectId { get; init; }
    public string? Description { get; init; }
    public decimal? UnitQuantity { get; init; }
    public decimal? UnitCost { get; init; }
    public string? TimelineType { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public decimal Budget { get; init; }
    public LineItemBudgetDetailLIBResponse? LineItemBudget { get; init; }
    public LineItemBudgetDetailActivityResponse? LineItemBudgetActivity { get; init; }
    public LineItemBudgetDetailObjectResponse? Object { get; init; }
    public LineItemBudgetDetailWFPExpenditureResponse? WFPObjectiveActivityExpenditure { get; init; }
    public LineItemBudgetDetailExpenseClassResponse? ExpenseClass { get; init; }
}

public record LineItemBudgetDetailLIBResponse
{
    public Guid Id { get; init; }
    public string LIBNumber { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
}

public record LineItemBudgetDetailActivityResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
}

public record LineItemBudgetDetailObjectResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
    public Guid? ParentId { get; init; }
    public LineItemBudgetDetailObjectParentResponse? ParentObject { get; init; }
}

public record LineItemBudgetDetailObjectParentResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
}

public record LineItemBudgetDetailWFPExpenditureResponse
{
    public Guid Id { get; init; }
    public string? ItemDescription { get; init; }
    public int? Quantity { get; init; }
    public decimal? UnitCost { get; init; }
}

public record LineItemBudgetDetailExpenseClassResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
}

public record CreateLineItemBudgetDetailRequest
{
    public Guid LineItemBudgetId { get; init; }
    public Guid? LineItemBudgetActivityId { get; init; }
    public Guid? WFPObjectiveActivityExpenditureId { get; init; }
    public Guid ObjectId { get; init; }
    public string? Description { get; init; }
    public int? UnitQuantity { get; init; }
    public decimal? UnitCost { get; init; }
    public string? TimelineType { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public decimal Budget { get; init; }
}

public record UpdateLineItemBudgetDetailRequest
{
    public Guid? LineItemBudgetId { get; init; }
    public Guid? LineItemBudgetActivityId { get; init; }
    public Guid? WFPObjectiveActivityExpenditureId { get; init; }
    public Guid? ObjectId { get; init; }
    public string? Description { get; init; }
    public int? UnitQuantity { get; init; }
    public decimal? UnitCost { get; init; }
    public string? TimelineType { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public decimal? Budget { get; init; }
}
