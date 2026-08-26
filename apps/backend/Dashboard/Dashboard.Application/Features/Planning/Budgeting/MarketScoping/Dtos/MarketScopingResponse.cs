namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Dtos;

/// <summary>
/// Response DTO for market scoping.
/// </summary>
public record MarketScopingResponse
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public decimal EstimatedBudget { get; set; }
    public DateTime PeriodFrom { get; set; }
    public DateTime PeriodTo { get; set; }
    public DateTime DeliveryDate { get; set; }
    // Project-level linkage
    public Guid? TargetLineItemBudgetId { get; set; }
    public string? TargetLineItemBudgetNumber { get; set; }
    // Activity-level linkage
    public Guid? TargetLineItemBudgetActivityId { get; set; }
    public string? TargetLineItemBudgetActivityName { get; set; }
    public string Status { get; set; } = string.Empty;
    public Guid? SignedDocumentFileId { get; set; }
    public string AgencyName { get; set; } = string.Empty;
    public string DepartmentUnit { get; set; } = string.Empty;
    public string RepresentativeName { get; set; } = string.Empty;
    public string RepresentativeDesignation { get; set; } = string.Empty;
    public List<MarketScopingActivityResponse> ActivitiesConducted { get; set; } = [];
    public List<MarketScopingParameterResponse> ParameterEvaluations { get; set; } = [];
    public List<MarketScopingHistoryResponse> StatusHistory { get; set; } = [];
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
}
