namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Dtos;

public class UpdateTenantMemberDto
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public List<Guid> RoleIds { get; set; } = [];
    public Guid ConcurrencyStamp { get; set; }
}
