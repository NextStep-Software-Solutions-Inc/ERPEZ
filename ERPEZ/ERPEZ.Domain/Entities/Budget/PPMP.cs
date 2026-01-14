using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Other;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Budget;

/// <summary>
/// Project Procurement Management Plan (PPMP)
/// Note: Combine Office PPMP and Department PPMP into a single PPMP
///       ParentPPMPId (nullable): For sub-DU PPMP consolidation. 
///       IsFinal (boolean): Distinguishes between indicative and final PPMPs. 
/// </summary>
public class PPMP : ApprovableEntity
{
    public PPMP() { }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid DeliveryUnitId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string PPMPNumber { get; set; } = string.Empty;
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? DUAllocationId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string? Description { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public int FiscalYear { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsFinal { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string? EndUser { get; set; }
    
    // Navigation properties
    public virtual DeliveryUnit DeliveryUnit { get; set; } = null!;
    public virtual DUAllocation? DUAllocation { get; set; }
    public virtual List<PPMPItem> PPMPItems { get; set; } = [];
    
    // Inherited from ApprovableEntity:  
    // public string Status { get; set; }
    // public DateTime? SubmittedDate { get; set; }
    // public DateTime? ApprovedDate { get; set; }
}
