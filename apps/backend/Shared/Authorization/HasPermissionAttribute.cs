using Microsoft.AspNetCore.Authorization;

namespace ERPEZ.Shared.Authorization;

/// <summary>
/// Authorize attribute that checks for a specific functional permission policy.
/// </summary>
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, Inherited = false, AllowMultiple = true)]
public sealed class HasPermissionAttribute : AuthorizeAttribute
{
    public string Permission { get; }

    public HasPermissionAttribute(string permission) : base(policy: permission)
    {
        Permission = permission;
    }
}
