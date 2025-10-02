namespace ERPEZ.TenantManagement.Application.Features.TenantSettings.Dtos;

public class TenantSettingDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string BaseURL { get; set; } = string.Empty;
    public string DbConnectionString { get; set; } = string.Empty;
    public string BillingContactEmail { get; set; } = string.Empty;
}