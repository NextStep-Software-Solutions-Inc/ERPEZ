namespace ERPEZ.TenantManagement.Application.Features.Tenants.Commands.Dto;

public class UpdateTenantDto
{
    public string Name { get; set; } = string.Empty;
    public bool OnPremise { get; set; }
    public string BillingContactEmail { get; set; } = string.Empty;
}
