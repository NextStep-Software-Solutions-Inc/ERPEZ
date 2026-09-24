using ERPEZ.TenantManagement.Domain.Common;
using ERPEZ.TenantManagement.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.TenantManagement.Domain.Entities;

public class TenantMember : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid TenantId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string UserId { get; set; } = string.Empty;

    /// <summary>
    /// Clerk subject identifier (sub claim, e.g., user_2...) representing the user's federated identity.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public string ExternalIdentityId { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string Email { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string FirstName { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string LastName { get; set; } = string.Empty;

    /// <summary>
    /// Legacy role enum - maintained for backwards compatibility during migration.
    /// Functional RBAC queries use RoleAssignments.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    [Obsolete("Use RoleAssignments instead for functional RBAC", error: false)]
    public TenantMemberRole Role { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Status Status { get; set; }

    /// <summary>
    /// Optimistic concurrency token. Rotated on every successful mutation.
    /// </summary>
    public Guid ConcurrencyStamp { get; set; } = Guid.NewGuid();

    /// <summary>
    /// SHA-256 hash of single-use invitation token. Never exposed in API DTOs.
    /// </summary>
    public string? InvitationTokenHash { get; set; }

    /// <summary>
    /// UTC expiration time of the pending invitation.
    /// </summary>
    public DateTime? InvitationExpiresAtUtc { get; set; }

    public virtual Tenant Tenant { get; set; } = null!;
    public virtual List<TenantMemberRoleAssignment> RoleAssignments { get; set; } = [];
}
