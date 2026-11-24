using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Roles.Commands.CreateTenantRole;

public class CreateTenantRoleCommand : IRequest<ApiResponse<Guid>>
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<string> PermissionKeys { get; set; } = [];
}
