using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Planning;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.AMS;

/// <summary>
/// Association linking a Dashboard User with an operational AmsRole.
/// </summary>
public class UserRoleAssignment : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid UserId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid RoleId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual AmsRole Role { get; set; } = null!;
}
