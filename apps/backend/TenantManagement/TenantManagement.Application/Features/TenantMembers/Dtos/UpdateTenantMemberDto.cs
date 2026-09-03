using ERPEZ.TenantManagement.Domain.Enums;

namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Dtos;

public class UpdateTenantMemberDto
{
    public Guid? TenantId { get; set; }
    public string? UserId { get; set; }
    public string? ExternalIdentityId { get; set; }
    public List<Guid>? RoleIds { get; set; }
    public Status? Status { get; set; }
}
