using ERPEZ.Domain.Common;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Represents a budget call (proposal/revision) for a specific Fiscal Year.
/// </summary>
public class BudgetCall : TenantScopedEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid FiscalYearId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Type { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime SubmissionDeadline { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string Status { get; set; } = nameof(BudgetCallStatusEnum.Draft);

    /// <summary>
    /// Navigation property to the parent Fiscal Year.
    /// </summary>
    public virtual FiscalYear? FiscalYear { get; set; }
}
