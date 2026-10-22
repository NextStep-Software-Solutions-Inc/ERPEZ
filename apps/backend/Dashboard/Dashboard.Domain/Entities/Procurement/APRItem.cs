using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Planning;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Line item selected from an approved APP or added from PSDBM catalog into an APR.
/// </summary>
public class APRItem : TenantScopedEntity
{
    public APRItem() { }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid APRId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? APPItemId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? PPMPItemId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? ItemCode { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Description { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Unit { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal QuantityRequested { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal UnitCost { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal TotalCost { get; set; }

    // Navigation properties
    public virtual APR APR { get; set; } = null!;
    public virtual APPItem? APPItem { get; set; }
    public virtual PPMPItem? PPMPItem { get; set; }
    public virtual List<APRItemMilestone> APRItemMilestones { get; set; } = [];
}
