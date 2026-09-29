using ERPEZ.TenantManagement.Domain.Enums;

namespace ERPEZ.TenantManagement.Application.Features.Roles.Dtos;

public class RoleSummaryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsSystemRole { get; set; }
    public RoleScope Scope { get; set; }
    public bool IsAssignableToTenant { get; set; }
    public Guid? TenantId { get; set; }
    public List<string> PermissionKeys { get; set; } = [];
    public List<string> PermissionDisplayNames { get; set; } = [];
}
