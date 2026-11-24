namespace ERPEZ.Application.Features.Planning.UACSValidation.Dtos;

/// <summary>
/// Represents the result of a UACS code combination validation.
/// </summary>
public record UACSValidationResultResponse
{
    /// <summary>
    /// Indicates whether the combination is valid.
    /// </summary>
    public bool IsValid { get; init; }

    /// <summary>
    /// List of validation messages (errors or warnings).
    /// </summary>
    public List<ValidationMessage> Messages { get; init; } = [];

    /// <summary>
    /// List of rules that were evaluated.
    /// </summary>
    public List<AppliedRule> AppliedRules { get; init; } = [];
}

/// <summary>
/// Represents a validation message from rule evaluation.
/// </summary>
public record ValidationMessage
{
    /// <summary>
    /// The severity of the message (Error, Warning, Info).
    /// </summary>
    public string Severity { get; init; } = "Error";

    /// <summary>
    /// The validation message text.
    /// </summary>
    public string Message { get; init; } = string.Empty;

    /// <summary>
    /// The ID of the rule that generated this message.
    /// </summary>
    public Guid? RuleId { get; init; }

    /// <summary>
    /// The name of the rule that generated this message.
    /// </summary>
    public string? RuleName { get; init; }
}

/// <summary>
/// Represents a rule that was applied during validation.
/// </summary>
public record AppliedRule
{
    /// <summary>
    /// The unique identifier of the rule.
    /// </summary>
    public Guid RuleId { get; init; }

    /// <summary>
    /// The name of the rule.
    /// </summary>
    public string RuleName { get; init; } = string.Empty;

    /// <summary>
    /// The type of rule.
    /// </summary>
    public string RuleType { get; init; } = string.Empty;

    /// <summary>
    /// The priority of the rule.
    /// </summary>
    public int Priority { get; init; }

    /// <summary>
    /// Indicates whether the rule passed validation.
    /// </summary>
    public bool Passed { get; init; }
}
