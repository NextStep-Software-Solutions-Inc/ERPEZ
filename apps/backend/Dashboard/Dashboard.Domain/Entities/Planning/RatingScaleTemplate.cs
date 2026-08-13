using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Represents a rating scale template that can be used for KPI measurements.
/// Each template can have multiple levels (1-5) with score ranges.
/// </summary>
public class RatingScaleTemplate : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Description { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsFixed { get; set; } = false; // If true, levels cannot be edited

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsDefault { get; set; } = false; // If true, this is the default template

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? GeneralRatingScaleId { get; set; }

    // Navigation Properties
    public virtual GeneralRatingScale? GeneralRatingScale { get; set; }
    public virtual List<RatingScaleLevel> RatingScaleLevels { get; set; } = [];
    public virtual List<KPIMeasurement> KPIMeasurements { get; set; } = [];
    public virtual List<FYActiveKPIMeasurement> FYActiveKPIMeasurements { get; set; } = [];
}
