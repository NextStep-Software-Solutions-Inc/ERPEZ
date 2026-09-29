namespace ERPEZ.Shared.Models;

/// <summary>
/// Advisory workspace context representation used across Cloud and On-Premise UI and bootstrap endpoints.
/// </summary>
public class UnifiedTenantContextDto
{
    public Guid Id { get; set; }
    public string? ExternalOrgId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Slug { get; set; }
}

/// <summary>
/// Deterministic multi-tenant response returned by /api/tenant/context during client startup.
/// </summary>
public class TenantBootstrapContextResponse
{
    public UnifiedTenantContextDto? ActiveTenant { get; set; }
    public List<UnifiedTenantContextDto> AvailableTenants { get; set; } = [];
}
