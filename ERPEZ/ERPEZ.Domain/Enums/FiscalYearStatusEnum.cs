namespace ERPEZ.Domain.Enums;

/// <summary>
/// Represents the lifecycle status of a Fiscal Year.
/// </summary>
public enum FiscalYearStatusEnum
{
    /// <summary>
    /// Construction Mode - The year is being initialized by Admins.
    /// Hidden from regular users. Configure policies, limits, and signatories.
    /// </summary>
    setup,

    /// <summary>
    /// Budget Call Mode - Open for preparing next year's budget.
    /// No money can be spent yet. Set targets, create budget proposals, and submit APP.
    /// </summary>
    planning,

    /// <summary>
    /// Execution Mode - The Live year. Only ONE year can be Active at a time.
    /// Creating/Approving all financial transactions (PR, PO, etc).
    /// </summary>
    active,

    /// <summary>
    /// Archived Mode - The year is finished and audited. Strictly Read-Only.
    /// Viewing reports and history. Generating financial statements.
    /// </summary>
    closed
}
