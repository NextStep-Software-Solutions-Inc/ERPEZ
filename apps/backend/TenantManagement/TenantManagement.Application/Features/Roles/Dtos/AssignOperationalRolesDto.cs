namespace ERPEZ.TenantManagement.Application.Features.Roles.Dtos;

public class AssignOperationalRolesDto
{
    public Guid TargetTenantMemberId { get; set; }
    public List<Guid> RoleIds { get; set; } = [];
}
