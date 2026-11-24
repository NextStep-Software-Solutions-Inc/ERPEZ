using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Represents the type/classification of a position.
/// </summary>
public class PositionType : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string Code { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? EducationalLevel { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Category { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsCareerEligibilityRequired { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public bool CanReportDirectly { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Navigation property to positions of this type.
    /// </summary>
    public virtual List<Position> Positions { get; set; } = [];
}
