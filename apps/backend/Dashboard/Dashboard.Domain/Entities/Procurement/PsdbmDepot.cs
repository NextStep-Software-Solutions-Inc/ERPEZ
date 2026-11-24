using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Represents a PSDBM depot (Regional or LGU)
/// </summary>
public class PsdbmDepot : BaseEntity
{
    public PsdbmDepot() { }

    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Region { get; set; }

    public string? SourceValue { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string Mode { get; set; } = "regional"; // "regional" or "lgu"

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public virtual ICollection<PsdbmDepotProduct> DepotProducts { get; set; } = [];
}
