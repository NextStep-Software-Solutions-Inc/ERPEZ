namespace ERPEZ.TenantManagement.Application.Features.Tenants.Dtos;

public class TenantModuleDto
{
    public Guid Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
}
