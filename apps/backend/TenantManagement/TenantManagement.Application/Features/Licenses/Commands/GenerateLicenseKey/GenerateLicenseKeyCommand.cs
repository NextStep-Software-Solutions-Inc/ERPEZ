using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Application.Features.Licenses.Dtos;
using ERPEZ.TenantManagement.Domain.Enums;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Licenses.Commands.GenerateLicenseKey;

public class GenerateLicenseKeyCommand : IRequest<ApiResponse<LicenseKeyDto>>
{
    public string Prefix { get; set; } = "EPZ-ONPREM";
    public string BoundEmail { get; set; } = string.Empty;
    public Plan Plan { get; set; } = Plan.OnPremise;
    public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddYears(1);
    public string AllowedDomain { get; set; } = string.Empty;
    public int MaxTenants { get; set; } = 1;
    public int MaxUsers { get; set; } = 50;
    public bool IsAirGapped { get; set; } = true;
    public Guid? TenantId { get; set; }
    public Guid? TenantSubscriptionId { get; set; }
    public string? Notes { get; set; }
}
