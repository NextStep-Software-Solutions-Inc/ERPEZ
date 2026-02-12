using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Represents threshold ranges for procurement modes with effectivity dates.
/// </summary>
public class ProcurementModeThreshold : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal MinThreshold { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal? MaxThreshold { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime EffectivityStart { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime? EffectivityEnd { get; set; }

    // Foreign Keys
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ProcurementModeId { get; set; }

    // Navigation Properties
    public virtual ProcurementMode ProcurementMode { get; set; } = null!;
}
