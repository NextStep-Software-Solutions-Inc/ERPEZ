using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Other;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;
using PlanningObject = ERPEZ.Domain.Entities.Planning.Object;

namespace ERPEZ.Domain.Entities.Budget;

/// <summary>
/// Budget details/line items for each activity or project
/// Note: LIB detail is usually quarterly, but let's allow for flexibility;
///       users should be able to choose between monthly and quarterly
/// </summary>
public class LineItemBudgetDetail : BaseEntity
{
    public LineItemBudgetDetail() { }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? LineItemBudgetActivityId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid LIBId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? WFPExpenditureId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ObjectId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string? Description { get; set; }
    
    /// <summary>
    /// EF Config: .HasConversion<string>()
    /// Values: Monthly, Quarterly
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public TimelineTypeEnum TimelineType { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime StartDate { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime EndDate { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal Budget { get; set; }
    
    // Navigation properties
    public virtual LineItemBudget LineItemBudget { get; set; } = null!;
    public virtual LineItemBudgetActivity? LineItemBudgetActivity { get; set; }
    public virtual WFPObjectiveTargetExpenditure? WFPExpenditure { get; set; }
    public virtual PlanningObject Object { get; set; } = null!;
    public virtual List<PPMPItem> PPMPItems { get; set; } = [];
}
