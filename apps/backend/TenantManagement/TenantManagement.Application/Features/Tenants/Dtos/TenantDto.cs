using ERPEZ.TenantManagement.Application.Features.TenantMembers.Dtos;
using ERPEZ.TenantManagement.Application.Features.TenantSettings.Dtos;
using ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Dtos;

namespace ERPEZ.TenantManagement.Application.Features.Tenants.Dtos;

public class TenantDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TenantSettingDto? TenantSetting { get; set; }
    public List<TenantSubscriptionDto> TenantSubscriptions { get; set; } = [];
    public List<TenantMemberDto> TenantMembers { get; set; } = [];
}
