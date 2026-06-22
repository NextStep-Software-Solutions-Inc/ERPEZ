using System;
using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Represents a scheduled bidding activity for a procurement project.
/// </summary>
public class BiddingActivitySchedule : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ProcurementProjectId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string ActivityType { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime StartDate { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime EndDate { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string Venue { get; set; } = string.Empty;

    // Navigation properties
    public virtual ProcurementProject ProcurementProject { get; set; } = null!;
}
