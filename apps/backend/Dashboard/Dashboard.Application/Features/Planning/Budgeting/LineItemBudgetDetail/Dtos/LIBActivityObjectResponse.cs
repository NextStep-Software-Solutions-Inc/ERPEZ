
namespace ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Dtos;

public record LIBActivityObjectResponse
{
    public Guid ParentObjectId { get; init; }
    public string ParentObjectCode { get; init; } = string.Empty;
    public string ParentObjectName { get; init; } = string.Empty;
    public List<LIBActivityObjectItemResponse> Items { get; init; } = [];
}

public record LIBActivityObjectItemResponse
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public decimal TotalBudget { get; init; }
}