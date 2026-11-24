using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Domain.Enums;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Commands.ToggleTenantMemberStatus;

public class ToggleTenantMemberStatusCommand : IRequest<ApiResponse<Guid>>
{
    public Guid Id { get; set; }
    public Status Status { get; set; }
    public Guid ConcurrencyStamp { get; set; }
}
