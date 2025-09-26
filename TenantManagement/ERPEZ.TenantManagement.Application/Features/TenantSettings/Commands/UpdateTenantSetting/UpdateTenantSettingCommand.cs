using ERPEZ.TenantManagement.Application.Common;
using ERPEZ.TenantManagement.Domain.Entities;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantSettings.Commands.UpdateTenantSetting;

public class UpdateTenantSettingCommand : IRequest<ApiResponse<TenantSetting>>
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = string.Empty;
    public string DbConnectionString { get; set; } = string.Empty;
    public string BillingContactEmail { get; set; } = string.Empty;
}
