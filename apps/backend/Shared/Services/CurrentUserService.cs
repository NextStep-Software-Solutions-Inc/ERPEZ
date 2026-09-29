using System.Security.Claims;
using ERPEZ.Shared.Interfaces;
using Microsoft.AspNetCore.Http;

namespace ERPEZ.Shared.Services;

/// <summary>
/// Default implementation of ICurrentUserService reading security claims from HttpContext.
/// </summary>
public sealed class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    private const string claimOfficeId = "office_id";

    public string? ExternalIdentityId => httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier) 
        ?? httpContextAccessor.HttpContext?.User?.FindFirstValue("sub");

    public string? UserId => ExternalIdentityId;

    public string? Email => httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Email)
        ?? httpContextAccessor.HttpContext?.User?.FindFirstValue("email")
        ?? httpContextAccessor.HttpContext?.User?.FindFirstValue("primary_email_address");

    public string? Username => httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Name)
        ?? httpContextAccessor.HttpContext?.User?.FindFirstValue("preferred_username")
        ?? httpContextAccessor.HttpContext?.User?.FindFirstValue("username");

    public string? FullName
    {
        get
        {
            var user = httpContextAccessor.HttpContext?.User;
            if (user == null) return null;

            var name = user.FindFirstValue("name") 
                ?? user.FindFirstValue("full_name") 
                ?? user.FindFirstValue(ClaimTypes.GivenName);

            if (!string.IsNullOrWhiteSpace(name)) return name;

            var firstName = user.FindFirstValue("first_name") ?? user.FindFirstValue(ClaimTypes.GivenName);
            var lastName = user.FindFirstValue("last_name") ?? user.FindFirstValue(ClaimTypes.Surname);

            if (!string.IsNullOrWhiteSpace(firstName) || !string.IsNullOrWhiteSpace(lastName))
            {
                return $"{firstName} {lastName}".Trim();
            }

            return null;
        }
    }

    public bool IsAuthenticated => httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;

    public bool IsSuperAdmin
    {
        get
        {
            var user = httpContextAccessor.HttpContext?.User;
            if (user == null) return false;

            var claimVal = user.FindFirstValue("is_super_admin") 
                ?? user.FindFirstValue("super_admin");
            if (bool.TryParse(claimVal, out var isSuper) && isSuper)
            {
                return true;
            }

            return user.IsInRole("SuperAdmin") || user.IsInRole("Platform Administrator");
        }
    }

    public Guid? OfficeId
    {
        get
        {
            var officeClaim = httpContextAccessor.HttpContext?.User?.FindFirstValue(claimOfficeId);
            return Guid.TryParse(officeClaim, out var officeId) ? officeId : null;
        }
    }

    public IReadOnlyList<string> Roles
    {
        get
        {
            var user = httpContextAccessor.HttpContext?.User;
            if (user == null) return [];

            var roleClaims = user.FindAll(ClaimTypes.Role).Select(c => c.Value);
            var customRoleClaims = user.FindAll("role").Select(c => c.Value);
            var rolesClaims = user.FindAll("roles").Select(c => c.Value);
            var orgRoleClaims = user.FindAll("org_role").Select(c => c.Value);

            return roleClaims
                .Concat(customRoleClaims)
                .Concat(rolesClaims)
                .Concat(orgRoleClaims)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();
        }
    }

    public bool IsInRole(string role)
    {
        return Roles.Contains(role, StringComparer.OrdinalIgnoreCase);
    }
}
