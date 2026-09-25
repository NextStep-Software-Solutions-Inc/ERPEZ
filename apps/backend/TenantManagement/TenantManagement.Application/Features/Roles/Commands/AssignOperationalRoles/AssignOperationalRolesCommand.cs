using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Roles.Commands.AssignOperationalRoles;

public record AssignOperationalRolesCommand(
    Guid TargetTenantMemberId,
    List<Guid> RoleIds
) : IRequest<ApiResponse<Unit>>;
