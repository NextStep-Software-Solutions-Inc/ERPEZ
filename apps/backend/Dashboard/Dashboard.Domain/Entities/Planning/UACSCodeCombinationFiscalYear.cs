using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Represents the fiscal year validity period for a UACS code combination.
/// Tracks when a specific code combination is valid and can be used for transactions.
/// </summary>
public class UACSCodeCombinationFiscalYear : BaseEntity
{
    /// <summary>
    /// Reference to the UACS code combination.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid UACSCodeCombinationId { get; set; }

    /// <summary>
    /// Reference to the fiscal year.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid FiscalYearId { get; set; }

    /// <summary>
    /// The date when this combination becomes valid for transactions.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime IsValidFrom { get; set; }

    /// <summary>
    /// The date when this combination is no longer valid (null means no expiry).
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime? IsValidTo { get; set; }

    /// <summary>
    /// Indicates whether this combination-fiscal year association is currently active.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsActive { get; set; }

    /// <summary>
    /// Navigation property for the UACS code combination.
    /// </summary>
    public virtual UACSCodeCombination UACSCodeCombination { get; set; } = null!;

    /// <summary>
    /// Navigation property for the fiscal year.
    /// </summary>
    public virtual FiscalYear FiscalYear { get; set; } = null!;
}
