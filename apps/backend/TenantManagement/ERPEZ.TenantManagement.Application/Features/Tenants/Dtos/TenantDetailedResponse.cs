namespace ERPEZ.TenantManagement.Application.Features.Tenants.Dtos;

public class TenantDetailedResponse
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public string? Code { get; set; }
    public string? Description { get; set; }
    public string? Address { get; set; }
    public string? ContactEmail { get; set; }
    public string? ContactPhone { get; set; }
    public string? Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
}
