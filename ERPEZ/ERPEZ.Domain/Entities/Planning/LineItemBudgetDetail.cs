using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Planning;
using Sieve.Attributes;
using PlanningObject = ERPEZ.Domain.Entities.Planning.Object;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Budget details/line items for each activity or project
/// Note: LIB detail is usually quarterly, but let's allow for flexibility;
///       users should be able to choose between monthly and quarterly
/// </summary>
public class LineItemBudgetDetail : BaseEntity
{
    public LineItemBudgetDetail() { }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid LineItemBudgetId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? LineItemBudgetActivityId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? WFPObjectiveActivityExpenditureId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ObjectId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string? Description { get; set; }

    /// <summary>
    /// WFP ActivityLevel only: quantity of items.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal? UnitQuantity { get; set; }

    /// <summary>
    /// WFP ActivityLevel only: cost per unit.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal? UnitCost { get; set; }

    /// <summary>
    /// Values: Monthly, Quarterly. Null for WFP (period lives on BudgetAllocation).
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public string? TimelineType { get; set; }
    
    /// <summary>
    /// Null for WFP (period lives on BudgetAllocation).
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime? StartDate { get; set; }
    
    /// <summary>
    /// Null for WFP (period lives on BudgetAllocation).
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime? EndDate { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal Budget { get; set; }

    // Navigation properties
    public virtual LineItemBudget LineItemBudget { get; set; } = null!;
    public virtual LineItemBudgetActivity? LineItemBudgetActivity { get; set; }
    public virtual WFPObjectiveActivityExpenditure? WFPObjectiveActivityExpenditure { get; set; }
    public virtual PlanningObject Object { get; set; } = null!;
    public virtual List<PPMPItem> PPMPItems { get; set; } = [];
}
