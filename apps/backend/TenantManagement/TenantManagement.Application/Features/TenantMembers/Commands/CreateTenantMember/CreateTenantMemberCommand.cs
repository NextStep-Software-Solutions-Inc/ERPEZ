using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Domain.Enums;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Commands.CreateTenantMember;

public class CreateTenantMemberCommand : IRequest<ApiResponse<Guid>>
{
    public Guid TenantId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string? ExternalIdentityId { get; set; }
    public List<Guid>? RoleIds { get; set; }
    public Status Status { get; set; }
}
