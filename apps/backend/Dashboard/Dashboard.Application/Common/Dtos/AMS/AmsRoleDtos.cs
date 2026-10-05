namespace ERPEZ.Application.Common.Dtos.AMS;

public class AmsRoleDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsSystemRole { get; set; }
    public bool IsActive { get; set; }
    public int UserCount { get; set; }
    public int PermissionCount { get; set; }
    public List<string> Permissions { get; set; } = [];
}

public class CreateAmsRoleDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> Permissions { get; set; } = [];
}

public class UpdateAmsRoleDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public List<string> Permissions { get; set; } = [];
}

public class AssignUserRolesDto
{
    public Guid UserId { get; set; }
    public List<Guid> RoleIds { get; set; } = [];
}

public class PermissionGroupDto
{
    public string Category { get; set; } = string.Empty;
    public List<string> Permissions { get; set; } = [];
}

public class ActivateLicenseRequestDto
{
    public string Key { get; set; } = string.Empty;
}
