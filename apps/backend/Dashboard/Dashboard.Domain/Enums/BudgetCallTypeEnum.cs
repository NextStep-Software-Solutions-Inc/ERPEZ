namespace ERPEZ.Domain.Enums;

/// <summary>
/// Represents the type of budget call.
/// </summary>
public enum BudgetCallTypeEnum
{
    /// <summary>
    /// Initial budget proposal for the fiscal year.
    /// </summary>
    InitialProposal,

    /// <summary>
    /// Supplemental budget request during the fiscal year.
    /// </summary>
    SupplementalBudget,

    /// <summary>
    /// Budget revision or adjustment.
    /// </summary>
    BudgetRevision,

    /// <summary>
    /// Mid-year budget review.
    /// </summary>
    MidYearReview,

    /// <summary>
    /// Year-end budget adjustment.
    /// </summary>
    YearEndAdjustment
}
