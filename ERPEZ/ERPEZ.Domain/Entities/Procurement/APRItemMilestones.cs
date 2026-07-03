using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Planning;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// BAC (Bids and Awards Committee) milestone for an APR line item.
/// Mirrors APPProcurementSchedule's pattern (procurement activity + scheduled date),
/// but scoped to the APR item rather than the PPMP item, since APR milestones track
/// the actual procurement activity schedule for that specific requested purchase
/// (shown as "4 milestones set" badge, Image 7/10).
/// </summary>
public class APRItemMilestone : BaseEntity
{
    public APRItemMilestone() { }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid APRItemId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ProcurementActivityTypeId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime ScheduledDate { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Remarks { get; set; }

    // Navigation properties
    public virtual APRItem APRItem { get; set; } = null!;
    public virtual ProcurementActivityType ProcurementActivityType { get; set; } = null!;
}
