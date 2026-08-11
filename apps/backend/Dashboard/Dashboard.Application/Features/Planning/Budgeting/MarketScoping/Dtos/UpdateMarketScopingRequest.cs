namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Dtos;

/// <summary>
/// Request DTO for updating a market scoping.
/// </summary>
public record UpdateMarketScopingRequest
{
    public Guid Id { get; set; }
    public required string ProjectName { get; set; }
    public decimal EstimatedBudget { get; set; }
    public DateTime PeriodFrom { get; set; }
    public DateTime PeriodTo { get; set; }
    public DateTime DeliveryDate { get; set; }
    public Guid? TargetLineItemBudgetActivityId { get; set; }
    public List<MarketScopingActivityDto> ActivitiesConducted { get; set; } = [];
    public List<MarketScopingParameterDto> ParameterEvaluations { get; set; } = [];
}
