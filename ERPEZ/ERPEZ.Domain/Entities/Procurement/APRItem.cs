using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Planning;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Line item selected from an approved APP into an APR.
/// Snapshots Qty/UnitCost/TotalCost at selection time (Image 5-10) — these values
/// are editable post-creation ("APP Pre-population" note, Image 8) and no longer
/// sync live with the source APPItem.
/// </summary>
public class APRItem : BaseEntity
{
    public APRItem() { }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid APRId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid APPItemId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid PPMPItemId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal QuantityRequested { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal UnitCost { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal TotalCost { get; set; }

    // Navigation properties
    public virtual APR APR { get; set; } = null!;
    public virtual APPItem APPItem { get; set; } = null!;
    public virtual PPMPItem PPMPItem { get; set; } = null!;
    public virtual List<APRItemMilestone> APRItemMilestones { get; set; } = [];
}
