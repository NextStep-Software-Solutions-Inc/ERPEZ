using ERPEZ.Domain.Common;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;
using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Entities.Procurement;

public class PRItem : BaseEntity
{
    public PRItem() { }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid PurchaseRequestId { get; set; }

    // Always set — references the PPMPItem being requested (NonCSE or CSE out-of-stock)
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid PPMPItemId { get; set; }

    // Only set for OutOfStockCSE tab — null for NonCSE items
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? APRItemId { get; set; }

    // Denormalised from PPMPItem at creation time for report stability
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Description { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal UnitCost { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public int RequestedQuantity { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal Amount { get; set; }

    // CSE stock number from DBM-PS catalogue — null for NonCSE items
    [Sieve(CanFilter = true, CanSort = true)]
    public string? StockNo { get; set; }

    // True = NonCSE (from Office PPMP), False = OutOfStockCSE (from APR)
    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsNonCSE { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public AllocationMonthEnum RequestedMonth { get; set; }
    public virtual PurchaseRequest PurchaseRequest { get; set; } = null!;
    public virtual PPMPItem PPMPItem { get; set; } = null!;
    public virtual APRItem? APRItem { get; set; }
}