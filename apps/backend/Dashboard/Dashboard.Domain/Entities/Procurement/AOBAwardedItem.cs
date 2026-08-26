using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Planning;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Stores the awarded/winning supplier details for each RFQ line item in the AOB.
/// </summary>
public class AOBAwardedItem : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid AOBId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid RFQItemId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid WinningSupplierId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal AwardedUnitPrice { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public int AwardedQuantity { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal TotalAwardedAmount { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal Score { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? AwardReason { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? PurchaseOrderId { get; set; }

    // Navigation properties
    public virtual AOB AOB { get; set; } = null!;
    public virtual RFQItem RFQItem { get; set; } = null!;
    public virtual Supplier WinningSupplier { get; set; } = null!;
    public virtual PurchaseOrder? PurchaseOrder { get; set; }
}
