using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Application.Features.TenantMembers.Dtos;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Commands.CreateTenantMember;

public class CreateTenantMemberCommand : IRequest<ApiResponse<TenantMemberDto>>
{
    public Guid TenantId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}
