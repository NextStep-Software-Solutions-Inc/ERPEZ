using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Application.Features.Modules.Dtos;
using ERPEZ.TenantManagement.Domain.Entities;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Modules.Commands.UpdateModule;

public sealed class UpdateModuleCommand : IRequest<ApiResponse<Module>>
{
    public Guid Id { get; set; }
    public required UpdateModuleDto UpdateModule { get; set; }
}
