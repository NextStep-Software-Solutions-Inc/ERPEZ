using ERPEZ.TenantManagement.Domain.Common;
using ERPEZ.TenantManagement.Domain.Enums;
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

    /// <summary>
    /// Domain scope classification (Platform or Tenant).
    /// Defaults to Unknown (fail-closed) as a safety net; application code must explicitly define Scope.
    /// Converted to string in database persistence.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public RoleScope Scope { get; set; } = RoleScope.Unknown;

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? TenantId { get; set; }

    /// <summary>
    /// Deny-by-default assignability. Only explicitly approved system roles
    /// and validated tenant-custom roles have this flag set to true.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsAssignableToTenant { get; set; } = false;

    /// <summary>
    /// For tenant-custom roles: store the list of granted atomic permission keys.
    /// System roles resolve their permissions directly from the in-code registry.
    /// </summary>
    public virtual List<string> Permissions { get; set; } = [];

    // Navigation properties
    public virtual Tenant? Tenant { get; set; }
    public virtual List<TenantMemberRoleAssignment> MemberAssignments { get; set; } = [];

    /// <summary>
    /// Centralized predicate defining whether a role is assignable within a given tenant and optional scope.
    /// Invariant: r.IsAssignableToTenant && !r.IsDeleted && (!scope.HasValue || r.Scope == scope.Value) && (!r.TenantId.HasValue || r.TenantId.Value == tenantId)
    /// </summary>
    public static System.Linq.Expressions.Expression<Func<Role, bool>> IsAssignableToTenantPredicate(Guid tenantId, RoleScope? scope = null)
    {
        if (scope.HasValue)
        {
            return r => r.IsAssignableToTenant &&
                        !r.IsDeleted &&
                        r.Scope == scope.Value &&
                        (!r.TenantId.HasValue || r.TenantId.Value == tenantId);
        }

        return r => r.IsAssignableToTenant &&
                    !r.IsDeleted &&
                    (!r.TenantId.HasValue || r.TenantId.Value == tenantId);
    }

    /// <summary>
    /// Evaluates if this role instance is assignable within a given tenant and optional scope.
    /// </summary>
    public bool IsAssignableTo(Guid tenantId, RoleScope? scope = null)
    {
        return IsAssignableToTenant &&
               !IsDeleted &&
               (!scope.HasValue || Scope == scope.Value) &&
               (!TenantId.HasValue || TenantId.Value == tenantId);
    }
}
