using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Represents a Performance Management Team (PMT) for an organization.
/// </summary>
public class PMT : TenantScopedEntity
{
    /// <summary>
    /// Foreign key to the Organization entity.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid OrganizationId { get; set; }

    /// <summary>
    /// The active year for this PMT.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public int ActiveYear { get; set; }

    /// <summary>
    /// Indicates whether this PMT uses manual workflow.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsManualWorkflow { get; set; } = false;

    /// <summary>
    /// Indicates whether this PMT is currently active.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsActive { get; set; } = true;

    // Navigation Properties
    public virtual Organization? Organization { get; set; }
    public virtual List<PMTMember> PMTMembers { get; set; } = [];
}
