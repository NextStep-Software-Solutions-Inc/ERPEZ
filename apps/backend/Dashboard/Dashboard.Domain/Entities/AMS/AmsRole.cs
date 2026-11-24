using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.AMS;

/// <summary>
/// Operational RBAC role defined inside the Dashboard AMS engine.
/// Decoupled from external tenant management tables.
/// </summary>
public class AmsRole : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string Description { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsSystemRole { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public virtual ICollection<AmsRolePermission> Permissions { get; set; } = new List<AmsRolePermission>();
    public virtual ICollection<UserRoleAssignment> UserAssignments { get; set; } = new List<UserRoleAssignment>();
}
