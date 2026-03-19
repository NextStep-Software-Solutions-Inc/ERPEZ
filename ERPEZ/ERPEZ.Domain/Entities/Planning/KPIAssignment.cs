using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Represents the assignment/distribution of FYActiveKPI targets to Offices (Level 2).
/// This is where Planning distributes agency targets down to delivery units.
/// </summary>
public class KPIAssignment : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid FYActiveKPIId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid OfficeId { get; set; }

    // Office-Level Targets (Level 2)
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal AssignedTargetAnnual { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal? AssignedTargetQ1 { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal? AssignedTargetQ2 { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal? AssignedTargetQ3 { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal? AssignedTargetQ4 { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsLocked { get; set; } = false; // If True, Office cannot change the value

    // Navigation Properties
    public virtual FYActiveKPI? FYActiveKPI { get; set; }
    public virtual Office? Office { get; set; }
}
