using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Planning;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Line Items for a Supplier's Bid/Quotation linked to an APPItem (acting as RFQ Item).
/// </summary>
public class SupplierBidItem : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid SupplierBidId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid APPItemId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal UnitPrice { get; set; }

    public string? BrochureFileUrl { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Brand { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Model { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Color { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsResponsive { get; set; } = true;

    // Navigation properties
    public virtual SupplierBid SupplierBid { get; set; } = null!;
    public virtual APPItem APPItem { get; set; } = null!;
}
