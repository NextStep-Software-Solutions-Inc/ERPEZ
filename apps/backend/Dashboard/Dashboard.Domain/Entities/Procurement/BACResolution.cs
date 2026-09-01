using System;
using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Represents a BAC resolution linked to a procurement project.
/// </summary>
public class BACResolution : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ProcurementProjectId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string ResolutionType { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string ResolutionNumber { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime DateResolved { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string Status { get; set; } = string.Empty;

    public string? WhereasClause { get; set; }
    public string? ResolvedLocation { get; set; }

    // Navigation properties
    public virtual ProcurementProject ProcurementProject { get; set; } = null!;
    public virtual ICollection<BACResolutionWhereasClauseItem> WhereasClauseItems { get; set; } = new List<BACResolutionWhereasClauseItem>();
    public virtual ICollection<BACResolutionClauseLink> ClauseLinks { get; set; } = new List<BACResolutionClauseLink>();
}
