using ERPEZ.Domain.Common;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Per-month quantity for a PRItem — mirrors PPMPItemAllocation.
/// Used to render the monthly grid columns in the "Add Office PPMP Items" modal (Image 4)
/// and the "Add APR Items" modal (Images 7/8).
/// </summary>
public class PRItemMonthlyQuantity : BaseEntity
{
    public PRItemMonthlyQuantity() { }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid PRItemId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public AllocationMonthEnum Month { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public int Quantity { get; set; }

    // Navigation
    public virtual PRItem PRItem { get; set; } = null!;
}