namespace ERPEZ.Domain.Enums;

/// <summary>
/// Represents the type of UACS validation rule.
/// </summary>
public enum UACSRuleTypeEnum
{
    /// <summary>
    /// Rule that defines allowed code combinations.
    /// </summary>
    AllowedCombination = 1,

    /// <summary>
    /// Rule that defines forbidden code combinations.
    /// </summary>
    ForbiddenCombination = 2,

    /// <summary>
    /// Rule with conditional validation logic.
    /// </summary>
    ConditionalValidation = 3
}
