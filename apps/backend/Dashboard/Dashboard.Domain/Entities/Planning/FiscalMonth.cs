using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Represents a month within a Fiscal Year with its own locking state.
/// </summary>
public class FiscalMonth : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid FiscalYearId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public int MonthIndex { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsLocked { get; set; } = false;

    public Guid? ModifiedByUserId { get; set; }

    /// <summary>
    /// Navigation property to the parent Fiscal Year.
    /// </summary>
    public virtual FiscalYear? FiscalYear { get; set; }
}
