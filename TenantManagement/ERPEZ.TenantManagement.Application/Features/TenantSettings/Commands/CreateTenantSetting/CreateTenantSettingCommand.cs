using ERPEZ.TenantManagement.Application.Common;
using ERPEZ.TenantManagement.Domain.Entities;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantSettings.Commands.CreateTenantSetting;

public class CreateTenantSettingCommand : IRequest<ApiResponse<TenantSetting>>
{
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = string.Empty;
    public string DBConnectionString { get; set; } = string.Empty;
    public string BillingContactEmail { get; set; } = string.Empty;
}
