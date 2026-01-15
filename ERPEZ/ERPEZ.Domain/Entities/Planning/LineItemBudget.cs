using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Line Item Budget (LIB) - Header entity
/// Hierarchy: LIB → LIBItem → LIBItemCategory (Header → Program/Activity → Specific Expenses)
/// Note: We didn't use OPCRId and WFPId in the LIB entity because the budget is allocated
///       to individual activities, not to the entire OPCR or WFP document. 
/// GetAll: by account group, quarter, expense class, fund
/// </summary>
public class LineItemBudget : ApprovableEntity
{
    public LineItemBudget() { }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid DeliveryUnitId { get; set; }
    
    /// <summary>
    /// EF Config: .HasConversion<string>()
    /// Values: OPCR, WFP, Independent
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public SourceType SourceType { get; set; }
    
    /// <summary>
    /// SourceId is either OPCRId or WFPId
    /// Nullable because Independent source type doesn't need a source ID
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? SourceId { get; set; }
    
    /// <summary>
    /// EF Config: .HasConversion<string>()
    /// Values: ActivityLevel, ProjectLevel
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public BudgetScope Scope { get; set; }
    
    /// <summary>
    /// Flag indicating whether this LIB is consolidated from child delivery units
    /// True if this LIB consolidates data from child DUs, False otherwise
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsConsolidated { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? DUAllocationId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string LIBNumber { get; set; } = string.Empty;
    
    [Sieve(CanFilter = true, CanSort = true)]
    public int FiscalYear { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string? Name { get; set; }
    
    /// <summary>
    /// Overrides ApprovableEntity.Status to use LIBStatus enum
    /// EF Config: .HasConversion<string>()
    /// Values: Draft, Submitted, Approved, Returned, Consolidated
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public new LIBStatus Status { get; set; }
    
    // Navigation properties
    public virtual DeliveryUnit DeliveryUnit { get; set; } = null!;
    public virtual DUAllocation? DUAllocation { get; set; }
    public virtual List<LineItemBudgetActivity> LineItemBudgetActivities { get; set; } = [];
    public virtual List<LineItemBudgetDetail> LineItemBudgetDetails { get; set; } = [];

}
