using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// PPMP Expenditure Item - Expenditure items within a PPMP activity
/// Represents a procurement item group that may or may not be procurable
/// </summary>
public class PPMPExpenditureItem : TenantScopedEntity
{
    public PPMPExpenditureItem() { }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid PPMPId { get; set; } // ← add this
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? PPMPActivityId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ObjectId { get; set; } // ← replaces LineItemBudgetDetailId
    
    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsProcurable { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal TotalCost { get; set; }
    
    // Navigation properties
    public virtual PPMP PPMP { get; set; } = null!;
    public virtual PPMPActivity? PPMPActivity { get; set; } = null!;
    public virtual List<PPMPItem> PPMPItems { get; set; } = [];
    public virtual Object Object { get; set; } = null!;
}
