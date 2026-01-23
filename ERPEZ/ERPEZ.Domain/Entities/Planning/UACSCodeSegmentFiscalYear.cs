using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Represents the fiscal year validity period for a UACS code segment.
/// Tracks when a specific segment configuration is active and effective for a fiscal year.
/// </summary>
public class UACSCodeSegmentFiscalYear : BaseEntity
{
    /// <summary>
    /// Reference to the UACS code segment.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid UACSCodeSegmentId { get; set; }

    /// <summary>
    /// Reference to the fiscal year.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid FiscalYearId { get; set; }

    /// <summary>
    /// The date when this segment becomes effective for the fiscal year.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime EffectiveStartDate { get; set; }

    /// <summary>
    /// The date when this segment expires (null means no expiry).
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime? EffectiveEndDate { get; set; }

    /// <summary>
    /// Indicates whether this segment-fiscal year association is currently active.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsActive { get; set; }

    /// <summary>
    /// Navigation property for the UACS code segment.
    /// </summary>
    public virtual UACSCodeSegment UACSCodeSegment { get; set; } = null!;

    /// <summary>
    /// Navigation property for the fiscal year.
    /// </summary>
    public virtual FiscalYear FiscalYear { get; set; } = null!;
}
