using ERPEZ.TenantManagement.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.TenantManagement.Domain.Entities;

/// <summary>
/// Represents an atomic permission capability in the system.
/// </summary>
public class Permission : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public string Key { get; set; } = string.Empty; // e.g. planning.lib.create

    [Sieve(CanFilter = true, CanSort = true)]
    public string Module { get; set; } = string.Empty; // Planning, Procurement, Finance, Admin

    [Sieve(CanFilter = true, CanSort = true)]
    public string DisplayName { get; set; } = string.Empty;

    public string? Description { get; set; }

    // Navigation properties
    public virtual List<RolePermission> RolePermissions { get; set; } = [];
}
