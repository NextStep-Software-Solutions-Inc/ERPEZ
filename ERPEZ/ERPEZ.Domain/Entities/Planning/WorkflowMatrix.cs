using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Represents workflow approval matrix configuration per Fiscal Year and Organization.
/// DocumentType is nullable - if null, applies as general default for all document types.
/// </summary>
public class WorkflowMatrix : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid FiscalYearId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid OrganizationId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? DocumentType { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid RecommendedByUserId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ApprovedByUserId { get; set; }

    // Navigation Properties
    public virtual FiscalYear? FiscalYear { get; set; }
    public virtual Organization? Organization { get; set; }
}
