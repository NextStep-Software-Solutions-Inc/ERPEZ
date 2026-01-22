using ERPEZ.Domain.Common;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Represents a UACS code segment configuration that defines the structure and validation rules
/// for each of the 5 UACS elements (FundSource, Organization, Location, MFOPAP, Object).
/// </summary>
public class UACSCodeSegment : BaseEntity
{
    /// <summary>
    /// The type of UACS segment this configuration applies to.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public UACSSegmentTypeEnum SegmentType { get; set; }

    /// <summary>
    /// The name of the code segment.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// A detailed description of the code segment purpose and usage.
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// The display order for UI presentation (1-5).
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public int DisplayOrder { get; set; }

    /// <summary>
    /// Indicates whether this segment is required in UACS code combinations.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsRequired { get; set; }

    /// <summary>
    /// Maximum length allowed for codes in this segment.
    /// </summary>
    public int MaxLength { get; set; }

    /// <summary>
    /// Regular expression pattern for code format validation.
    /// </summary>
    public string Pattern { get; set; } = string.Empty;

    /// <summary>
    /// Indicates whether this segment is currently active.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsActive { get; set; }

    /// <summary>
    /// Navigation property for validation rules associated with this segment.
    /// </summary>
    public virtual List<UACSValidationRule> ValidationRules { get; set; } = [];
}
