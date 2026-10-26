using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Planning;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Linking table that connects a specific LineItemBudget to a specific activity.  
/// The foreign keys OPCRActivityId and WFPActivityId are nullable because an activity 
/// can only come from one of those sources, not both.
/// Note: If an activity is from an OPCR or WFP, the name should be copied from the source.  
///       If it's a new, ad-hoc activity, the user must provide a name.
/// </summary>
public class LineItemBudgetActivity : TenantScopedEntity
{
    public LineItemBudgetActivity() { }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid LineItemBudgetId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? WFPObjectiveActivityId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? OPCRActivityId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string PAPCode { get; set; } = string.Empty;
    
    // Navigation properties
    public virtual LineItemBudget LineItemBudget { get; set; } = null!;
    public virtual WFPObjectiveActivity? WFPObjectiveActivity { get; set; }
    public virtual OPCRActivity? OPCRActivity { get; set; }
    public virtual List<LineItemBudgetDetail> LineItemBudgetDetails { get; set; } = [];
}
