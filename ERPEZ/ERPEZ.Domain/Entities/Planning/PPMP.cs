using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Planning;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Project Procurement Management Plan (PPMP)
/// Note: Combine Office PPMP and Department PPMP into a single PPMP
///       ParentId (nullable): For sub-office PPMP consolidation. 
///       IsFinal (boolean): Distinguishes between indicative and final PPMPs. 
///       ConsolidatedIntoId (nullable): Points to the parent PPMP this was consolidated into.
/// </summary>
public class PPMP : ApprovableEntity
{
    public PPMP() { }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid OfficeId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid FiscalYearId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? FundSourceId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? LIBId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? ParentId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string PPMPNumber { get; set; } = string.Empty;
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string? Description { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsFinal { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsMaster { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public int Version { get; set; } = 1;
    
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal TotalEstimatedBudget { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? ConsolidatedIntoId { get; set; }
    
    // Navigation properties
    public virtual Office Office { get; set; } = null!;
    public virtual FiscalYear FiscalYear { get; set; } = null!;
    public virtual FundSource FundSource { get; set; } = null!;
    public virtual LineItemBudget LineItemBudget { get; set; } = null!;
    public virtual PPMP? ParentPPMP { get; set; }
    public virtual PPMP? ConsolidatedInto { get; set; }
    public virtual List<PPMP> ChildPPMPs { get; set; } = [];
    public virtual List<PPMPActivity> PPMPActivities { get; set; } = [];
    public virtual List<ApprovalEvent> ApprovalEvents { get; set; } = [];
    
    // Inherited from ApprovableEntity:  
    // public StatusEnum Status { get; set; }
    // public DateTime? SubmittedDate { get; set; }
    // public DateTime? ApprovedDate { get; set; }
}
