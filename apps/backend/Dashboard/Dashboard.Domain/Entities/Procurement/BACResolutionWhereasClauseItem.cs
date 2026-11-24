using System;
using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Planning;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Represents an ordered join entity linking a BACResolution to a BACResolutionWhereasClause.
/// </summary>
public class BACResolutionWhereasClauseItem : TenantScopedEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid BACResolutionId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid BACResolutionWhereasClauseId { get; set; }

    public int Order { get; set; }

    // Navigation properties
    public virtual BACResolution BACResolution { get; set; } = null!;
    public virtual BACResolutionWhereasClause BACResolutionWhereasClause { get; set; } = null!;
}
