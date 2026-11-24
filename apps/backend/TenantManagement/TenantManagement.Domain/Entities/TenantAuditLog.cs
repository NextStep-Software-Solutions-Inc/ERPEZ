using ERPEZ.TenantManagement.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.TenantManagement.Domain.Entities;

/// <summary>
/// Immutable, append-only audit record capturing security-critical tenant membership and role mutations.
/// </summary>
public class TenantAuditLog : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid TenantId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string ActorExternalIdentityId { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string ActorEmail { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? TargetMemberId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string TargetEmail { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string Action { get; set; } = string.Empty;

    public string? BeforeStateJson { get; set; }

    public string? AfterStateJson { get; set; }

    // Navigation property
    public virtual Tenant? Tenant { get; set; }
}
