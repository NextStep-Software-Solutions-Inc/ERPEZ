namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Dtos;

/// <summary>
/// Request DTO for creating a market scoping.
/// </summary>
public record CreateMarketScopingRequest
{
    public Guid UserId { get; set; }
    public required string ProjectName { get; set; }
    public decimal EstimatedBudget { get; set; }
    public DateTime PeriodFrom { get; set; }
    public DateTime PeriodTo { get; set; }
    public DateTime DeliveryDate { get; set; }
    /// <summary>Project-level MSF target. Mutually exclusive with TargetLineItemBudgetActivityId.</summary>
    public Guid? TargetLineItemBudgetId { get; set; }
    /// <summary>Activity-level MSF target. Mutually exclusive with TargetLineItemBudgetId.</summary>
    public Guid? TargetLineItemBudgetActivityId { get; set; }
    /// <summary>Office context for authorization. Future: derived from auth token.</summary>
    public Guid OfficeId { get; set; }
    public List<MarketScopingActivityDto> ActivitiesConducted { get; set; } = [];
    public List<MarketScopingParameterDto> ParameterEvaluations { get; set; } = [];
}
