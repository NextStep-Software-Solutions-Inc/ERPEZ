using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Represents workflow approval matrix configuration per Fiscal Year and Office (Department).
/// DocumentType is nullable - if null, applies as general default for all document types.
/// Uses Position-based approvals for organizational stability - positions are stable, personnel change.
/// </summary>
public class WorkflowMatrix : TenantScopedEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid FiscalYearId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid OfficeId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? DocumentType { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string Status { get; set; } = string.Empty;

    /// <summary>
    /// Position that holds recommending approval authority (e.g., Budget Officer, Department Manager).
    /// Actual user is resolved at runtime via PersonnelPosition.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid RecommendingApproverPositionId { get; set; }

    /// <summary>
    /// Position that holds final approval authority (e.g., Department Head, Director).
    /// Actual user is resolved at runtime via PersonnelPosition.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid FinalApproverPositionId { get; set; }

    // Navigation Properties
    public virtual FiscalYear? FiscalYear { get; set; }
    public virtual Office? Office { get; set; }
    public virtual Position? RecommendingApproverPosition { get; set; }
    public virtual Position? FinalApproverPosition { get; set; }
}
