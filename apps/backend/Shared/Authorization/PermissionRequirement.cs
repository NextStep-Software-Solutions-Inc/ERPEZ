using Microsoft.AspNetCore.Authorization;

namespace ERPEZ.Shared.Authorization;

/// <summary>
/// Requirement that encapsulates the required functional permission key.
/// </summary>
public sealed class PermissionRequirement : IAuthorizationRequirement
{
    public string Permission { get; }

    public PermissionRequirement(string permission)
    {
        Permission = permission ?? throw new ArgumentNullException(nameof(permission));
    }
}
