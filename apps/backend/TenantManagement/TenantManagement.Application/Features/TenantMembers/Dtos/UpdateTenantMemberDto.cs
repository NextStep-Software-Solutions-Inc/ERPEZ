namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Dtos;

public class UpdateTenantMemberDto
{
    public List<Guid> RoleIds { get; set; } = [];
    public Guid ConcurrencyStamp { get; set; }
}
