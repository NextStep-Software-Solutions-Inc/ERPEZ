using ERPEZ.TenantManagement.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.TenantManagement.Domain.Entities;

/// <summary>
/// Represents a dynamic functional role within TenantManagement.
/// Supports both global system roles (TenantId == null) and tenant-custom roles.
/// </summary>
public class Role : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string NormalizedName { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsSystemRole { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? TenantId { get; set; }

    // Navigation properties
    public virtual Tenant? Tenant { get; set; }
    public virtual List<RolePermission> RolePermissions { get; set; } = [];
    public virtual List<TenantMemberRoleAssignment> MemberAssignments { get; set; } = [];
}
