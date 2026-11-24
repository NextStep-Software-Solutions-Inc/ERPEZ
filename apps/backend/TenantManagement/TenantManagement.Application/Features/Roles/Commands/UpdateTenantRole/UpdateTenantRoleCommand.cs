using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Roles.Commands.UpdateTenantRole;

public class UpdateTenantRoleCommand : IRequest<ApiResponse<Guid>>
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<string> PermissionKeys { get; set; } = [];
}
