namespace ERPEZ.Domain.Enums;

/// <summary>
/// Represents the type of expense classification for Object codes.
/// </summary>
public enum ExpenseClassTypeEnum
{
    /// <summary>
    /// Personnel Services - salaries, wages, and benefits
    /// </summary>
    PersonnelServices = 1,

    /// <summary>
    /// Maintenance and Other Operating Expenses
    /// </summary>
    MaintenanceAndOperatingExpenses = 2,

    /// <summary>
    /// Capital Outlay - equipment, infrastructure, buildings
    /// </summary>
    CapitalOutlay = 3,

    /// <summary>
    /// Financial Expenses - interest, debt service
    /// </summary>
    FinancialExpenses = 4
}
