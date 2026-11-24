using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Unit of Measure for procurement items with hierarchical conversion support.
/// </summary>
public class UOM : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string Code { get; set; } = string.Empty;

    public string? Description { get; set; }

    /// <summary>
    /// Conversion factor relative to parent unit (e.g., Box of 12 = 12.00 relative to Piece).
    /// </summary>
    public decimal? ConversionFactor { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsActive { get; set; } = true;

    // Foreign Keys - Hierarchical structure
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? ParentId { get; set; }

    // Navigation Properties
    public virtual UOM? Parent { get; set; }
    public virtual List<UOM> Children { get; set; } = [];
    public virtual List<ProcurementItem> ProcurementItems { get; set; } = [];
}
