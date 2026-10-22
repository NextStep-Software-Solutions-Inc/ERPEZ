using System;
using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Planning;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Represents an ordered join entity linking a BACResolution to a generic ResolutionClause.
/// </summary>
public class BACResolutionClauseLink : TenantScopedEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid BACResolutionId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ResolutionClauseId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string ClauseType { get; set; } = "Whereas";

    public int Order { get; set; }

    // Navigation properties
    public virtual BACResolution BACResolution { get; set; } = null!;
    public virtual ResolutionClause ResolutionClause { get; set; } = null!;
}
