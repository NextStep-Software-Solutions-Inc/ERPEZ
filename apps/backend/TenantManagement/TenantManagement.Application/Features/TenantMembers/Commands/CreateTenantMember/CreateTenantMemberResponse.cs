namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Commands.CreateTenantMember;

public class CreateTenantMemberResponse
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string InvitationToken { get; set; } = string.Empty;
    public DateTime InvitationExpiresAtUtc { get; set; }
}
