using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Planning;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Header for a Supplier's Bid/Quotation submission for a specific RFQ.
/// </summary>
public class SupplierBid : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid RFQId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid SupplierId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string SubmissionType { get; set; } = "Electronic"; // Electronic, Physical, Manual

    [Sieve(CanFilter = true, CanSort = true)]
    public string Status { get; set; } = "DRAFT"; // DRAFT, SUBMITTED

    [Sieve(CanFilter = true, CanSort = true)]
    public int? ValidityPeriodDays { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? DeliveryPeriod { get; set; }

    public string? PaymentTerms { get; set; }

    public string? WarrantyTerms { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal TotalAmount { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime? SubmittedAt { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Remarks { get; set; }

    // Navigation properties
    public virtual RFQ RFQ { get; set; } = null!;
    public virtual Supplier Supplier { get; set; } = null!;
    public virtual List<SupplierBidItem> SupplierBidItems { get; set; } = [];
}
