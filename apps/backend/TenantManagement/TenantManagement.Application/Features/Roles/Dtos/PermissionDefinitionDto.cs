namespace ERPEZ.TenantManagement.Application.Features.Roles.Dtos;

public class PermissionDefinitionDto
{
    public string Key { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
}

public class PermissionCategoryDto
{
    public string Category { get; set; } = string.Empty;
    public List<PermissionDefinitionDto> Permissions { get; set; } = [];
}
