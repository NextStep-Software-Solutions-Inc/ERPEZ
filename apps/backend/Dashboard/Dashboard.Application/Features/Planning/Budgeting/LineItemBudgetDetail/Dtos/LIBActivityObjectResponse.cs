
namespace ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Dtos;

public record LIBActivityObjectResponse
{
    public Guid ObjectId { get; init; }
    public string ObjectCode { get; init; } = string.Empty;
    public string ObjectName { get; init; } = string.Empty;
    public decimal TotalBudget { get; init; }
}