using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Planning;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>Suppliers invited to canvass/bid on a given RFQ.</summary>
public class RFQSupplier : BaseEntity
{
    public RFQSupplier() { }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid RFQId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid SupplierId { get; set; }

    public DateTime InvitedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public virtual RFQ RFQ { get; set; } = null!;
    public virtual Supplier Supplier { get; set; } = null!;
}
