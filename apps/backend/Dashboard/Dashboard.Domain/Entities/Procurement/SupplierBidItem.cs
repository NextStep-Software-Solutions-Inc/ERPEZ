using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Line Item for a Supplier's Bid/Quotation linked to an RFQItem.
/// </summary>
public class SupplierBidItem : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid SupplierBidId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid RFQItemId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal UnitPrice { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal TotalPrice { get; set; }

    public Guid? BrochureFileId { get; set; }

    public string? BrochureFileUrl { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Brand { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Model { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Color { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsResponsive { get; set; } = true;

    [Sieve(CanFilter = true, CanSort = true)]
    public string? DisqualificationReason { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal? QualityScore { get; set; }

    // Navigation properties
    public virtual SupplierBid SupplierBid { get; set; } = null!;
    public virtual RFQItem RFQItem { get; set; } = null!;
}
