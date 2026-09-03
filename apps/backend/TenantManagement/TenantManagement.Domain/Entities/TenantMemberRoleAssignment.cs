namespace ERPEZ.TenantManagement.Domain.Entities;

/// <summary>
/// Join entity representing the assignment of a functional Role to a TenantMember.
/// </summary>
public class TenantMemberRoleAssignment
{
    public Guid TenantMemberId { get; set; }
    public Guid RoleId { get; set; }

    public virtual TenantMember TenantMember { get; set; } = null!;
    public virtual Role Role { get; set; } = null!;
}
