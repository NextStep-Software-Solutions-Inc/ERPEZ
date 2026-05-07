using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Represents a single level/tier within a RatingScaleTemplate (e.g., 1-5 rating).
/// Defines the score range and description for each rating value.
/// </summary>
public class RatingScaleLevel : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid RatingScaleTemplateId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public int RatingValue { get; set; } // 1-5

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Description { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal? MinValue { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal? MaxValue { get; set; }

    // Navigation Properties
    public virtual RatingScaleTemplate? RatingScaleTemplate { get; set; }
}
