using ERPEZ.Domain.Common;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Monthly allocation for PPMP items
/// Note: AllocationMonth uses enum (January-December) for simplified monthly tracking.
///       The system automatically maps the month to the corresponding fiscal year dates.
/// </summary>
public class PPMPItemAllocation : TenantScopedEntity
{
    public PPMPItemAllocation() { }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid PPMPItemId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public AllocationMonthEnum AllocationMonth { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public int Quantity { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal Amount { get; set; }
    
    // Navigation properties
    public virtual PPMPItem PPMPItem { get; set; } = null!;
}
