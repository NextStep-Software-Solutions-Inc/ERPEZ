using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Represents a master catalogue item from PSDBM / PS-PhilGEPS
/// </summary>
public class PsdbmProduct : BaseEntity
{
    public PsdbmProduct() { }

    [Sieve(CanFilter = true, CanSort = true)]
    public string ItemCode { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string Description { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string Category { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string Unit { get; set; } = string.Empty;

    public string? ImageUrl { get; set; }

    public string? TechnicalSpecificationUrl { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public virtual ICollection<PsdbmDepotProduct> DepotProducts { get; set; } = [];
}
