using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.AMS;

/// <summary>
/// Atomic permission mapping assigned to an AmsRole.
/// Corresponds to constants in ERPEZ.Shared.Constants.Permissions.
/// </summary>
public class AmsRolePermission : TenantScopedEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid RoleId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string PermissionKey { get; set; } = string.Empty;

    // Navigation property
    public virtual AmsRole Role { get; set; } = null!;
}
