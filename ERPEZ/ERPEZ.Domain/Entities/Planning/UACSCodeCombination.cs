using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Represents a valid combination of UACS codes across the 5 segments.
/// This entity tracks approved code combinations for budgeting and financial transactions.
/// </summary>
public class UACSCodeCombination : BaseEntity
{
    /// <summary>
    /// Reference to the FundSource (Funding segment).
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? FundSourceId { get; set; }

    /// <summary>
    /// Reference to the Organization (Organization segment).
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? OrganizationId { get; set; }

    /// <summary>
    /// Reference to the Location (Location segment).
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? LocationId { get; set; }

    /// <summary>
    /// Reference to the MFOPAP (Programs and Projects segment).
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? MFOPAPId { get; set; }

    /// <summary>
    /// Reference to the Object (Object of Expenditure segment).
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? ObjectId { get; set; }

    /// <summary>
    /// The concatenated UACS code (e.g., "01-101-001-P001-5021401000").
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public string CombinationCode { get; set; } = string.Empty;

    /// <summary>
    /// A description of what this code combination is used for.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Indicates whether this combination has passed all validation rules.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsValid { get; set; }

    /// <summary>
    /// The fiscal year this combination is valid for.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? FiscalYearId { get; set; }

    /// <summary>
    /// The date this combination becomes effective.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime EffectiveDate { get; set; }

    /// <summary>
    /// The date this combination expires (null means no expiry).
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime? ExpiryDate { get; set; }

    /// <summary>
    /// Indicates whether this combination is currently active.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsActive { get; set; }

    /// <summary>
    /// Navigation property for FundSource.
    /// </summary>
    public virtual FundSource? FundSource { get; set; }

    /// <summary>
    /// Navigation property for Organization.
    /// </summary>
    public virtual Organization? Organization { get; set; }

    /// <summary>
    /// Navigation property for Location.
    /// </summary>
    public virtual Location? Location { get; set; }

    /// <summary>
    /// Navigation property for MFOPAP.
    /// </summary>
    public virtual MFOPAP? MFOPAP { get; set; }

    /// <summary>
    /// Navigation property for Object.
    /// </summary>
    public virtual Object? Object { get; set; }

    /// <summary>
    /// Navigation property for FiscalYear.
    /// </summary>
    public virtual FiscalYear? FiscalYear { get; set; }

    /// <summary>
    /// Navigation property for transactions using this combination.
    /// </summary>
    public virtual List<Transaction> Transactions { get; set; } = [];

    /// <summary>
    /// Navigation property for fiscal year associations.
    /// </summary>
    public virtual List<UACSCodeCombinationFiscalYear> FiscalYearAssociations { get; set; } = [];
}
