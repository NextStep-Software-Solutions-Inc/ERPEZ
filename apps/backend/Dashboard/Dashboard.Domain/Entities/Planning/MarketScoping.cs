using ERPEZ.Domain.Common;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Market Scoping entity represents the scoping phase for market analysis and evaluation.
/// Contains activities conducted and parameter evaluations.
/// References a specific LineItemBudgetActivity instead of LineItemBudget.
/// </summary>
public class MarketScoping : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid UserId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string ProjectName { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal EstimatedBudget { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime PeriodFrom { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime PeriodTo { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime DeliveryDate { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? TargetLineItemBudgetActivityId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public StatusEnum Status { get; set; } = StatusEnum.Draft;

    public Guid? SignedDocumentFileId { get; set; }

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual LineItemBudgetActivity? TargetLineItemBudgetActivity { get; set; }
    public virtual List<MarketScopingActivity> ActivitiesConducted { get; set; } = [];
    public virtual List<MarketScopingParameter> ParameterEvaluations { get; set; } = [];
    public virtual List<MarketScopingHistory> StatusHistory { get; set; } = [];
}
