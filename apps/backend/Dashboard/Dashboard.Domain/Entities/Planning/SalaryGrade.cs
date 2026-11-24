using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Represents a salary grade level with step increments.
/// </summary>
public class SalaryGrade : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string Code { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public int GradeNumber { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal? StepIncrementAmount { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public int NumberOfSteps { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateOnly EffectiveDate { get; set; }

    public string? Description { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Navigation property to positions with this salary grade.
    /// </summary>
    public virtual List<Position> Positions { get; set; } = [];
}
