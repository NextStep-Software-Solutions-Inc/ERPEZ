using ERPEZ.Domain.Common;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Represents a validation rule for UACS codes that defines custom business logic
/// for validating code combinations and individual segments.
/// </summary>
public class UACSValidationRule : BaseEntity
{
    /// <summary>
    /// The unique name of the validation rule.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public string RuleName { get; set; } = string.Empty;

    /// <summary>
    /// A detailed description of what this rule validates.
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// The code segment this rule applies to (null means applies to all segments or combinations).
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? CodeSegmentId { get; set; }

    /// <summary>
    /// The type of segment this rule applies to (optional, for quick filtering).
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public UACSSegmentTypeEnum? SegmentType { get; set; }

    /// <summary>
    /// The validation expression or logic (can be regex, custom expression, etc.).
    /// </summary>
    public string ValidationExpression { get; set; } = string.Empty;

    /// <summary>
    /// The error message to display when validation fails.
    /// </summary>
    public string ErrorMessage { get; set; } = string.Empty;

    /// <summary>
    /// Indicates whether this validation rule is currently active.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsActive { get; set; }

    /// <summary>
    /// Priority/order in which this rule should be executed (lower number = higher priority, 1-100).
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public int Priority { get; set; }

    /// <summary>
    /// The type of validation rule (AllowedCombination, ForbiddenCombination, ConditionalValidation).
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public UACSRuleTypeEnum RuleType { get; set; }

    /// <summary>
    /// Conditional expression or lambda/rule script for advanced validation.
    /// </summary>
    public string? Condition { get; set; }

    /// <summary>
    /// Optional filter: applies rule only to this specific FundSource.
    /// </summary>
    public Guid? FundSourceId { get; set; }

    /// <summary>
    /// Optional filter: applies rule only to this specific Object.
    /// </summary>
    public Guid? ObjectId { get; set; }

    /// <summary>
    /// Optional filter: applies rule only to this specific Location.
    /// </summary>
    public Guid? LocationId { get; set; }

    /// <summary>
    /// Navigation property for the associated code segment.
    /// </summary>
    public virtual UACSCodeSegment? CodeSegment { get; set; }

    /// <summary>
    /// Navigation property for the associated FundSource filter.
    /// </summary>
    public virtual FundSource? FundSource { get; set; }

    /// <summary>
    /// Navigation property for the associated Object filter.
    /// </summary>
    public virtual Object? Object { get; set; }

    /// <summary>
    /// Navigation property for the associated Location filter.
    /// </summary>
    public virtual Location? Location { get; set; }
}
