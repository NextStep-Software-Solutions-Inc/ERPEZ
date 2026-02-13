using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// United Nations Standard Products and Services Code - International classification standard.
/// Supports 4-level hierarchy: Segment > Family > Class > Commodity.
/// </summary>
public class UNSPSCCode : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public string Code { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    /// <summary>
    /// Level in hierarchy: 1=Segment, 2=Family, 3=Class, 4=Commodity.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public int Level { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsActive { get; set; } = true;

    // Foreign Keys - Hierarchical structure
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? ParentId { get; set; }

    // Navigation Properties
    public virtual UNSPSCCode? Parent { get; set; }
    public virtual List<UNSPSCCode> Children { get; set; } = [];
    public virtual List<ProcurementItem> ProcurementItems { get; set; } = [];
}
