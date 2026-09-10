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

    /// <summary>
    /// Deny-by-default assignability. Only explicitly approved operational system roles
    /// and validated tenant-custom roles have this flag set to true.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsAssignableToTenant { get; set; } = false;

    // Navigation properties
    public virtual Tenant? Tenant { get; set; }
    public virtual List<RolePermission> RolePermissions { get; set; } = [];
    public virtual List<TenantMemberRoleAssignment> MemberAssignments { get; set; } = [];

    /// <summary>
    /// Centralized predicate defining whether a role is assignable within a given tenant.
    /// Invariant: r.IsAssignableToTenant && !r.IsDeleted && (!r.TenantId.HasValue || r.TenantId.Value == tenantId)
    /// </summary>
    public static System.Linq.Expressions.Expression<Func<Role, bool>> IsAssignableToTenantPredicate(Guid tenantId)
    {
        return r => r.IsAssignableToTenant &&
                    !r.IsDeleted &&
                    (!r.TenantId.HasValue || r.TenantId.Value == tenantId);
    }

    /// <summary>
    /// Evaluates if this role instance is assignable within a given tenant.
    /// </summary>
    public bool IsAssignableTo(Guid tenantId)
    {
        return IsAssignableToTenant &&
               !IsDeleted &&
               (!TenantId.HasValue || TenantId.Value == tenantId);
    }
}
