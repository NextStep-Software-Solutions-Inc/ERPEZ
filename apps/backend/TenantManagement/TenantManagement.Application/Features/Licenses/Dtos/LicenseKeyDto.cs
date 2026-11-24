namespace ERPEZ.TenantManagement.Application.Features.Licenses.Dtos;

public class LicenseKeyDto
{
    public Guid Id { get; set; }
    public Guid? TenantId { get; set; }
    public string? TenantName { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Prefix { get; set; } = string.Empty;
    public string BoundEmail { get; set; } = string.Empty;
    public string Plan { get; set; } = string.Empty;
    public string AllowedDomain { get; set; } = string.Empty;
    public int MaxTenants { get; set; }
    public int MaxUsers { get; set; }
    public DateTime IssuedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool IsAirGapped { get; set; }
    public bool IsExpired { get; set; }
    public int RemainingDays { get; set; }
    public DateTime? ActivatedAt { get; set; }
    public string? Notes { get; set; }
}
