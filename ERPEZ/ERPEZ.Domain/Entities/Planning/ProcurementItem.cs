using ERPEZ.Domain.Common;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;
using ERPEZ.Domain.Entities.Procurement;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Represents an item in the procurement catalog/master list.
/// </summary>
public class ProcurementItem : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;

    public string? Specifications { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string Type { get; set; } = nameof(ProcurementItemTypeEnum.Expendable);

    /// <summary>
    /// Common-use Supplies and Equipment flag.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsCSE { get; set; } = false;

    /// <summary>
    /// Estimated lifespan in months/years.
    /// </summary>
    public int? ItemLife { get; set; }

    /// <summary>
    /// Manufacturer or internal SKU.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public string? ProductCode { get; set; }

    public string? ImageURL { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsActive { get; set; } = true;

    // Foreign Keys
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ObjectCodeId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? UNSPSCCodeId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid UOMId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? ItemCategoryId { get; set; }

    // Navigation Properties
    public virtual Object ObjectCode { get; set; } = null!;
    public virtual ItemCategory? ItemCategory { get; set; }
    public virtual UNSPSCCode? UNSPSCCode { get; set; }
    public virtual UOM UOM { get; set; } = null!;
}
