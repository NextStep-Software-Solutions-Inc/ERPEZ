using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Application.Features.TenantSettings.Dtos;
using ERPEZ.TenantManagement.Domain.Entities;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantSettings.Commands.UpdateTenantSetting;

public sealed class UpdateTenantSettingCommand : IRequest<ApiResponse<TenantSetting>>
{
    public Guid Id { get; set; }
    public UpdateTenantSettingDto? UpdateTenantSetting {  get; set; }
}
