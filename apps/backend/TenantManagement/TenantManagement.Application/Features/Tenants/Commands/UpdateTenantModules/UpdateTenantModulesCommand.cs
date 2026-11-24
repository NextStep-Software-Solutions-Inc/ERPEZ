using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Tenants.Commands.UpdateTenantModules;

public sealed class UpdateTenantModulesCommand : IRequest<ApiResponse<Guid>>
{
    public Guid TenantId { get; set; }
    public List<string> ModuleKeys { get; set; } = [];
}
