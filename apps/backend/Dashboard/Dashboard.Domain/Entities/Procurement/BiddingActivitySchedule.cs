using System;
using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Planning;
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
    public Guid ProcurementActivityTypeId { get; set; }

    /// <summary>Informational reference to the resolution that triggered generation — not the join key.</summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? BACResolutionId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime StartDate { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime EndDate { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string Venue { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string Status { get; set; } = "Pending";

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Remarks { get; set; }

    // ── TC-01 audit trail fields ────────────────────────────────────────────
    /// <summary>Original computed date before any manual override. Null if never adjusted.</summary>
    public DateTime? OriginalStartDate { get; set; }
    public DateTime? OriginalEndDate   { get; set; }

    /// <summary>Mandatory justification (>= 10 chars) when BAC manually overrides a computed date.</summary>
    public string? AdjustmentReason { get; set; }

    public Guid?     AdjustedByUserId { get; set; }
    public DateTime? AdjustedAt       { get; set; }

    /// <summary>True once the IB is marked posted to PhilGEPS — blocks further edits (HTTP 403).</summary>
    public bool IsLocked { get; set; } = false;

    // Navigation properties
    public virtual ProcurementProject ProcurementProject { get; set; } = null!;
    public virtual ProcurementActivityType ProcurementActivityType { get; set; } = null!;
}
