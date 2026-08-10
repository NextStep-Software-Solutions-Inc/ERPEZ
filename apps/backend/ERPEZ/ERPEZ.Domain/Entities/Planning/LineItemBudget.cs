using ERPEZ.Domain.Common;
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
    public Guid? FiscalYearId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? FundSourceId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? OfficeId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? ParentLIBId { get; set; }
    
    /// <summary>
    /// Values: OPCR, WFP, Independent
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public string SourceType { get; set; } = string.Empty;
    
    /// <summary>
    /// SourceId is either OPCRId or WFPId
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? SourceId { get; set; }
    
    /// <summary>
    /// Values: ActivityLevel, ProjectLevel
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public string Scope { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string Level { get; set; } = string.Empty;
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string LIBNumber { get; set; } = string.Empty;
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string? Name { get; set; }
    
    /// <summary>
    /// Overrides ApprovableEntity.Status to use a string-backed LIB workflow status.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public new string Status { get; set; } = "Draft";

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? AgencyMasterBudgetId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? ConsolidatedIntoLIBId { get; set; }

    public decimal TotalAmount => LineItemBudgetDetails?.Sum(d => d.Budget) ?? 0;

    [Sieve(CanFilter = true, CanSort = true)]
    public int Version { get; set; } = 1;

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? PreviousVersionId { get; set; }
    
    // Navigation properties
    public virtual FiscalYear? FiscalYearEntity { get; set; }
    public virtual FundSource? FundSource { get; set; }
    public virtual AgencyMasterBudget? AgencyMasterBudget { get; set; }
    public virtual Office? Office { get; set; }
    public virtual LineItemBudget? ParentLIB { get; set; }
    public virtual LineItemBudget? ConsolidatedIntoLIB { get; set; }
    public virtual LineItemBudget? PreviousVersion { get; set; }
    public virtual List<LineItemBudgetActivity> LineItemBudgetActivities { get; set; } = [];
    public virtual List<LineItemBudgetDetail> LineItemBudgetDetails { get; set; } = [];
    public virtual List<LineItemBudget> ChildLIBs { get; set; } = [];
    public virtual List<LineItemBudget> ConsolidatedChildLIBs { get; set; } = [];
    public virtual List<LineItemBudget> VersionHistory { get; set; } = [];
    public virtual List<LIBAmendmentRequest> LIBAmendmentRequests { get; set; } = [];
    public virtual List<LIBAmendmentRequest> ProposedLIBAmendmentRequests { get; set; } = [];

}
