using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Represents a category for procurement classification.
/// </summary>
public class ProcurementCategory : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    // Navigation Properties
    public virtual List<ProcurementMode> ProcurementModes { get; set; } = [];
}
