using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Represents a step within a salary grade progression.
/// </summary>
public class Step : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string Code { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public int StepNumber { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public int MinStep { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public int MaxStep { get; set; }

    public string? Description { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Navigation property to positions at this step.
    /// </summary>
    public virtual List<Position> Positions { get; set; } = [];
}
