using ERPEZ.Domain.Common;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class OPCRItemRating : TenantScopedEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid OPCRItemId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid FYActiveKPIMeasurementId  { get; set; }

    /// <summary>
    /// Dimension key (e.g. Efficiency, Quality, Timeliness) for this score.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public DimensionEnum? Dimension { get; set; }

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
    public virtual FYActiveKPIMeasurement FYActiveKPIMeasurement { get; set; } = null!;
}