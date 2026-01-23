using ERPEZ.Domain.Common;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Represents an expense classification category for Object codes.
/// Expense classes categorize objects into groups like Personnel Services, MOOE, Capital Outlay.
/// </summary>
public class ExpenseClass : BaseEntity
{
    /// <summary>
    /// The name of the expense class (e.g., "Salaries and Wages", "Utilities", "Equipment").
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// The unique code for the expense class.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public string Code { get; set; } = string.Empty;

    /// <summary>
    /// A detailed description of what this expense class covers.
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// The type of expense classification (PS, MOOE, CO, Financial).
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public ExpenseClassTypeEnum Type { get; set; }

    /// <summary>
    /// Indicates whether this expense class is currently active.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsActive { get; set; }

    /// <summary>
    /// Navigation property for the relationship between expense classes and objects.
    /// </summary>
    public virtual List<ObjectExpenseClass> ObjectExpenseClasses { get; set; } = [];
}
