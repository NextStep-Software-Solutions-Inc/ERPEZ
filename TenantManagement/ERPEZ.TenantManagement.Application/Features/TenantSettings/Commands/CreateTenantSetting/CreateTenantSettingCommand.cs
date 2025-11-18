using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantSettings.Commands.CreateTenantSetting;

public class CreateTenantSettingCommand : IRequest<ApiResponse<Guid>>
{
    public Guid TenantId { get; set; }
    public bool OnPremise { get; set; }
    public string BaseUrl { get; set; } = string.Empty;
    public string DBConnectionString { get; set; } = string.Empty;
    public string BillingContactEmail { get; set; } = string.Empty;
}
