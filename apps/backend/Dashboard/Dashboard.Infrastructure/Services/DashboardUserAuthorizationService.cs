using System.Security.Claims;
using ERPEZ.Infrastructure.Persistence;
using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace ERPEZ.Infrastructure.Services;

/// <summary>
/// Dashboard native AMS Authorization Service.
/// Completely decoupled from TenantManagement DB tables.
/// Evaluates user permissions using Dashboard's native AmsRole and UserRoleAssignment records.
/// Provides authoritative fallback to full permissions for Tenant Administrators & Workspace Admins.
/// </summary>
public class DashboardUserAuthorizationService(
    ApplicationDbContext dbContext,
    IMemoryCache memoryCache,
    IHttpContextAccessor? httpContextAccessor = null) : IUserAuthorizationService
{
    private const string cacheKeyPrefix = "perms:ams:";
    private static readonly TimeSpan slidingExpiration = TimeSpan.FromMinutes(5);
    private static readonly TimeSpan absoluteExpiration = TimeSpan.FromMinutes(15);

    public async Task<bool> HasPermissionAsync(
        string externalIdentityId,
        Guid? tenantId,
        string permission,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(externalIdentityId) || string.IsNullOrWhiteSpace(permission))
        {
            // Fail closed
            return false;
        }

        var permissions = await GetPermissionsAsync(externalIdentityId, tenantId, cancellationToken);
        return permissions.Contains(permission);
    }

    public async Task<IReadOnlySet<string>> GetPermissionsAsync(
        string externalIdentityId,
        Guid? tenantId,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(externalIdentityId))
        {
            // Fail closed
            return new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        }

        string? activeRoleHeader = null;
        if (httpContextAccessor?.HttpContext?.Request.Headers.TryGetValue("X-Operating-Role", out var opRoleHead) == true)
        {
            activeRoleHeader = opRoleHead.FirstOrDefault()?.Trim().ToLowerInvariant();
        }

        var cacheKey = $"{cacheKeyPrefix}{tenantId}_{externalIdentityId.Trim().ToLowerInvariant()}_{activeRoleHeader ?? "none"}";

        if (memoryCache.TryGetValue(cacheKey, out HashSet<string>? cachedPerms) && cachedPerms != null)
        {
            return cachedPerms;
        }

        // Check if caller holds administrator claims from their active token session
        var callerPrincipal = httpContextAccessor?.HttpContext?.User;
        var callerIsAdmin = false;
        string? callerEmail = callerPrincipal?.FindFirstValue(ClaimTypes.Email)
            ?? callerPrincipal?.FindFirstValue("email")
            ?? callerPrincipal?.FindFirstValue("primary_email_address");

        if (string.IsNullOrWhiteSpace(callerEmail) &&
            httpContextAccessor?.HttpContext?.Request.Headers.TryGetValue("X-User-Email", out var emailH) == true)
        {
            callerEmail = emailH.FirstOrDefault();
        }
        var normalizedCallerEmail = callerEmail?.Trim().ToLowerInvariant();

        if (callerPrincipal != null && callerPrincipal.Identity?.IsAuthenticated == true)
        {
            var callerSub = callerPrincipal.FindFirstValue(ClaimTypes.NameIdentifier) 
                ?? callerPrincipal.FindFirstValue("sub");

            if (string.Equals(callerSub, externalIdentityId, StringComparison.OrdinalIgnoreCase))
            {
                var roleClaims = callerPrincipal.FindAll(ClaimTypes.Role)
                    .Concat(callerPrincipal.FindAll("role"))
                    .Concat(callerPrincipal.FindAll("roles"))
                    .Concat(callerPrincipal.FindAll("org_role"))
                    .Select(c => c.Value);

                var isSuper = callerPrincipal.FindFirstValue("is_super_admin") ?? callerPrincipal.FindFirstValue("super_admin");
                callerIsAdmin = (bool.TryParse(isSuper, out var s) && s) ||
                    roleClaims.Any(r => r.Equals("org:admin", StringComparison.OrdinalIgnoreCase) ||
                                        r.Equals("admin", StringComparison.OrdinalIgnoreCase) ||
                                        r.Equals("Tenant Administrator", StringComparison.OrdinalIgnoreCase) ||
                                        r.Equals("TenantAdmin", StringComparison.OrdinalIgnoreCase) ||
                                        r.Equals("DASHBOARD SYSTEM ADMIN", StringComparison.OrdinalIgnoreCase) ||
                                        r.Equals("Workspace Admin", StringComparison.OrdinalIgnoreCase) ||
                                        r.Equals("System Administrator", StringComparison.OrdinalIgnoreCase) ||
                                        r.Equals("SuperAdmin", StringComparison.OrdinalIgnoreCase) ||
                                        r.Equals("platform_administrator", StringComparison.OrdinalIgnoreCase));
            }
        }

        if (!callerIsAdmin && httpContextAccessor?.HttpContext?.Request.Headers.TryGetValue("X-Operating-Role", out var opRoleH) == true)
        {
            var opRole = opRoleH.FirstOrDefault()?.Trim();
            if (!string.IsNullOrEmpty(opRole) &&
                (opRole.Equals("System Administrator", StringComparison.OrdinalIgnoreCase) ||
                 opRole.Equals("Tenant Administrator", StringComparison.OrdinalIgnoreCase) ||
                 opRole.Equals("Workspace Admin", StringComparison.OrdinalIgnoreCase) ||
                 opRole.Equals("Workspace Administrator", StringComparison.OrdinalIgnoreCase) ||
                 opRole.Equals("Platform Administrator", StringComparison.OrdinalIgnoreCase)))
            {
                callerIsAdmin = true;
            }
        }

        if (callerIsAdmin)
        {
            var allPerms = Permissions.GetAllPermissions().ToHashSet(StringComparer.OrdinalIgnoreCase);
            var cacheOptionsAdmin = new MemoryCacheEntryOptions
            {
                SlidingExpiration = slidingExpiration,
                AbsoluteExpirationRelativeToNow = absoluteExpiration
            };
            memoryCache.Set(cacheKey, allPerms, cacheOptionsAdmin);
            return allPerms;
        }

        var permissionsSet = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        if (dbContext.UserRoleAssignments != null)
        {
            var assignedPermissions = await dbContext.UserRoleAssignments
                .AsNoTracking()
                .Where(ra => !ra.IsDeleted &&
                             ra.User != null &&
                             (ra.User.ExternalIdentityId == externalIdentityId ||
                              ra.User.Username == externalIdentityId ||
                              (!string.IsNullOrEmpty(normalizedCallerEmail) && ra.User.Email.ToLower() == normalizedCallerEmail) ||
                              (ra.User.Email != null && ra.User.Email.ToLower() == externalIdentityId.ToLower())) &&
                             ra.User.IsActive &&
                             !ra.User.IsDeleted &&
                             ra.Role != null &&
                             ra.Role.IsActive &&
                             !ra.Role.IsDeleted)
                .SelectMany(ra => ra.Role.Permissions)
                .Where(p => !p.IsDeleted)
                .Select(p => p.PermissionKey)
                .Distinct()
                .ToListAsync(cancellationToken);

            foreach (var p in assignedPermissions)
            {
                permissionsSet.Add(p);
            }

            // Fallback: If active user has no explicit operational roles assigned, grant default permissions
            if (permissionsSet.Count == 0 && dbContext.Users != null)
            {
                var userExists = await dbContext.Users
                    .AsNoTracking()
                    .AnyAsync(u => !u.IsDeleted && u.IsActive &&
                                   (u.ExternalIdentityId == externalIdentityId ||
                                    u.Username == externalIdentityId ||
                                    (!string.IsNullOrEmpty(normalizedCallerEmail) && u.Email.ToLower() == normalizedCallerEmail) ||
                                    (u.Email != null && u.Email.ToLower() == externalIdentityId.ToLower())),
                                   cancellationToken);

                if (userExists && dbContext.AmsRoles != null)
                {
                    var viewerPerms = await dbContext.AmsRoles
                        .AsNoTracking()
                        .Where(r => !r.IsDeleted && r.IsActive && r.Name == "Employee / Viewer")
                        .SelectMany(r => r.Permissions)
                        .Where(p => !p.IsDeleted)
                        .Select(p => p.PermissionKey)
                        .Distinct()
                        .ToListAsync(cancellationToken);

                    if (viewerPerms != null && viewerPerms.Count > 0)
                    {
                        foreach (var p in viewerPerms)
                        {
                            permissionsSet.Add(p);
                        }
                    }
                    else
                    {
                        permissionsSet.Add(Permissions.Planning.viewOfficeDashboard);
                        permissionsSet.Add(Permissions.Planning.fiscalYearView);
                        permissionsSet.Add(Permissions.Planning.budgetCallView);
                        permissionsSet.Add(Permissions.Procurement.ppmpView);
                        permissionsSet.Add(Permissions.Procurement.biddingDocumentsView);
                    }
                }
            }
        }

        var cacheOptions = new MemoryCacheEntryOptions
        {
            SlidingExpiration = slidingExpiration,
            AbsoluteExpirationRelativeToNow = absoluteExpiration
        };

        memoryCache.Set(cacheKey, permissionsSet, cacheOptions);

        return permissionsSet;
    }

    public void InvalidateUserPermissions(string externalIdentityId, Guid? tenantId)
    {
        if (string.IsNullOrWhiteSpace(externalIdentityId))
        {
            return;
        }

        var cacheKey = $"{cacheKeyPrefix}{externalIdentityId.Trim().ToLowerInvariant()}";
        memoryCache.Remove(cacheKey);
    }
}
