using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Represents a snapshot of KPIMeasurement for a specific fiscal year.
/// Cloned from Master KPIMeasurement during activation to ensure immutability.
/// </summary>
public class FYActiveKPIMeasurement : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid FYActiveKPIId { get; set; }

    // Snapshotted Dimension Data from Master KPIMeasurement
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;

    public string Statement { get; set; } = string.Empty;

    public List<string> Dimensions { get; set; } = [];

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? RatingScaleTemplateId { get; set; }

    public List<string> MOVs { get; set; } = []; // Array of strings

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsMOVEditable { get; set; } = true;

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsScaleEditable { get; set; } = true;

    // Navigation Properties
    public virtual FYActiveKPI? FYActiveKPI { get; set; }
    public virtual RatingScaleTemplate? RatingScaleTemplate { get; set; }
}
