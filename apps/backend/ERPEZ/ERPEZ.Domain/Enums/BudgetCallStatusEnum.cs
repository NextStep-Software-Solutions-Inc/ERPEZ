namespace ERPEZ.Domain.Enums;

/// <summary>
/// Represents the status of a budget call.
/// </summary>
public enum BudgetCallStatusEnum
{
    /// <summary>
    /// Budget call is in draft mode and not yet published.
    /// </summary>
    Draft,

    /// <summary>
    /// Budget call is active and accepting submissions.
    /// </summary>
    Active,

    /// <summary>
    /// Budget call is closed and finalized.
    /// </summary>
    Closed
}
