namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Dtos;

public class UpdateTenantMemberDto
{
    public Guid? TenantId { get; set; }
    public string? UserId { get; set; }
    public string? Role { get; set; }
    public string? Status { get; set; }
}
