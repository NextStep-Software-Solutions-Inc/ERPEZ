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
    /// Keycloak subject identifier (sub claim) representing the user's federated identity.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public string ExternalIdentityId { get; set; } = string.Empty;

    /// <summary>
    /// Legacy role enum - maintained for backwards compatibility during migration.
    /// Functional RBAC queries use RoleAssignments.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    [Obsolete("Use RoleAssignments instead for functional RBAC", error: false)]
    public TenantMemberRole Role { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Status Status { get; set; }

    public virtual Tenant Tenant { get; set; } = null!;
    public virtual List<TenantMemberRoleAssignment> RoleAssignments { get; set; } = [];
}
