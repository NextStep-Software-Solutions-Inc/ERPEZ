using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Monthly/quarterly allocation for PPMP items
/// Note: When a user selects a specific month (e.g., January), the system automatically
///       calculates and fetches the corresponding date range for the backend.
/// </summary>
public class PPMPItemAllocation : BaseEntity
{
    public PPMPItemAllocation() { }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid PPMPItemId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime StartDate { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime EndDate { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public int Quantity { get; set; }
    
    // Navigation properties
    public virtual PPMPItem PPMPItem { get; set; } = null!;
}
