namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Commands.ResendInvitation;

public class ResendInvitationResponse
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string InvitationToken { get; set; } = string.Empty;
    public DateTime InvitationExpiresAtUtc { get; set; }
}
