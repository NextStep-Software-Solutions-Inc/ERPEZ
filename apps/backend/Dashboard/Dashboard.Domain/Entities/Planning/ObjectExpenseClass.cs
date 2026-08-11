using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Represents the mapping between Object codes and Expense Classes.
/// This entity links expenditure objects to their appropriate expense classifications.
/// </summary>
public class ObjectExpenseClass : BaseEntity
{
    /// <summary>
    /// Reference to the Object (expenditure type).
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ObjectId { get; set; }

    /// <summary>
    /// Reference to the Expense Class (classification category).
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ExpenseClassId { get; set; }

    /// <summary>
    /// Optional descriptive name for this specific mapping.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Additional description or notes for this object-expense class relationship.
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Indicates whether this mapping is currently active.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsActive { get; set; }

    /// <summary>
    /// Navigation property to the Object entity.
    /// </summary>
    public virtual Object? Object { get; set; }

    /// <summary>
    /// Navigation property to the ExpenseClass entity.
    /// </summary>
    public virtual ExpenseClass? ExpenseClass { get; set; }
}
