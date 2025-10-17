using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Application.Features.TenantMembers.Dtos;
using ERPEZ.TenantManagement.Domain.Entities;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Commands.UpdateTenantMember;

public class UpdateTenantMemberCommand : IRequest<ApiResponse<TenantMember>>
{
    public Guid Id { get; set; }
    public UpdateTenantMemberDto? UpdateTenantMember { get; set; }
}
