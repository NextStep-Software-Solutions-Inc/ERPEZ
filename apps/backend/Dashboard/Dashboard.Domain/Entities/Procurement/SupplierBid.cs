using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Planning;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Header for a Supplier's Bid/Submission for a specific RFQ.
/// </summary>
public class SupplierBid : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ProcurementProjectId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid SupplierId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string Status { get; set; } = "DRAFT";

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime? SubmittedAt { get; set; }

    // Navigation properties
    public virtual ProcurementProject ProcurementProject { get; set; } = null!;
    public virtual Supplier Supplier { get; set; } = null!;
    public virtual List<SupplierBidItem> SupplierBidItems { get; set; } = [];
}
