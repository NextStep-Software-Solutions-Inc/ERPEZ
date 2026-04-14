using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;

namespace ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Dtos;

public record LineItemBudgetDetailResponse
{
    public Guid Id { get; init; }
    public Guid LineItemBudgetId { get; init; }
    public Guid? LineItemBudgetActivityId { get; init; }
    public Guid? WFPObjectiveActivityExpenditureId { get; init; }
    public Guid ObjectId { get; init; }
    public string? Description { get; init; }
    public LIBTimelineTypeEnum TimelineType { get; init; }
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public decimal Budget { get; init; }
}

public record CreateLineItemBudgetDetailRequest
{
    public Guid LineItemBudgetId { get; init; }
    public Guid? LineItemBudgetActivityId { get; init; }
    public Guid? WFPObjectiveActivityExpenditureId { get; init; }
    public Guid ObjectId { get; init; }
    public string? Description { get; init; }
    public LIBTimelineTypeEnum TimelineType { get; init; }
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public decimal Budget { get; init; }
}

public record UpdateLineItemBudgetDetailRequest
{
    public Guid Id { get; init; }
    public Guid LineItemBudgetId { get; init; }
    public Guid? LineItemBudgetActivityId { get; init; }
    public Guid? WFPObjectiveActivityExpenditureId { get; init; }
    public Guid ObjectId { get; init; }
    public string? Description { get; init; }
    public LIBTimelineTypeEnum TimelineType { get; init; }
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public decimal Budget { get; init; }
}