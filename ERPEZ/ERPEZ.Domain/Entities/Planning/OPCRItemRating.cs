using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class OPCRItemRating : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid OPCRItemId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid KPIMeasurementId { get; set; }

    /// <summary>
    /// Dimension stored as string in DB.
    /// Use DimensionEnum in application layer.
    /// Values: Quality, Timeliness, Efficiency
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public string Dimension { get; set; } = string.Empty;

    /// <summary>
    /// Office self-rating score per dimension.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal? SelfRating { get; set; }

    /// <summary>
    /// PMT-assigned rating score per dimension.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal? PMTRating { get; set; }

    /// <summary>
    /// PMT remark/justification for the rating.
    /// </summary>
    public string? PMTRemark { get; set; }

    // Navigation properties
    public virtual OPCRItem OPCRItem { get; set; } = null!;
    public virtual KPIMeasurement KPIMeasurement { get; set; } = null!;
}