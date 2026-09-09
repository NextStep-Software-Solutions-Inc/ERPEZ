namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Dtos;

public class TenantMemberDto
{
    public Guid Id { get; set; }
    public Guid? TenantId { get; set; }
    public string? UserId { get; set; }
    public string? ExternalIdentityId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}".Trim();
    public string? Role { get; set; }
    public List<string> Roles { get; set; } = [];
    public string? Status { get; set; }
}
