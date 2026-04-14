using System.Security.Claims;
using ERPEZ.Application.Interfaces;
using Microsoft.AspNetCore.Http;

namespace ERPEZ.Infrastructure.Services;

/// <summary>
/// Service for accessing the currently authenticated user's information from JWT claims.
/// </summary>
public class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    private const string rolePlanningUser = "PlanningUser";
    private const string roleOfficeUser = "OfficeUser";
    private const string claimOfficeId = "office_id";

    public string? UserId => httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier) 
        ?? httpContextAccessor.HttpContext?.User?.FindFirstValue("sub");

    public string? Username => httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Name)
        ?? httpContextAccessor.HttpContext?.User?.FindFirstValue("preferred_username")
        ?? httpContextAccessor.HttpContext?.User?.FindFirstValue("username");

    public string? Email => httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Email)
        ?? httpContextAccessor.HttpContext?.User?.FindFirstValue("email");

    public string? Name => httpContextAccessor.HttpContext?.User?.FindFirstValue("name")
        ?? httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.GivenName);

    public IEnumerable<string> Roles
    {
        get
        {
            var user = httpContextAccessor.HttpContext?.User;
            if (user == null)
                return [];

            // Check both standard and custom role claims
            var roleClaims = user.FindAll(ClaimTypes.Role).Select(c => c.Value);
            var customRoleClaims = user.FindAll("role").Select(c => c.Value);

            return roleClaims.Concat(customRoleClaims).Distinct();
        }
    }

    public Guid? OfficeId
    {
        get
        {
            var officeIdClaim = httpContextAccessor.HttpContext?.User?.FindFirstValue(claimOfficeId);
            if (string.IsNullOrWhiteSpace(officeIdClaim))
                return null;

            return Guid.TryParse(officeIdClaim, out var officeId) ? officeId : null;
        }
    }

    public bool IsAuthenticated => httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;

    public bool IsInRole(string role)
    {
        return Roles.Contains(role, StringComparer.OrdinalIgnoreCase);
    }

    public bool IsPlanningUser => Roles.Contains(rolePlanningUser, StringComparer.OrdinalIgnoreCase);

    public bool IsOfficeUser => Roles.Contains(roleOfficeUser, StringComparer.OrdinalIgnoreCase);
}
