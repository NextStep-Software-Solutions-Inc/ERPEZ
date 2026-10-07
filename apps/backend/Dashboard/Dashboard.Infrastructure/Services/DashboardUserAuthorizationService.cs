using ERPEZ.Infrastructure.Persistence;
using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace ERPEZ.Infrastructure.Services;

/// <summary>
/// Dashboard native AMS Authorization Service.
/// Completely decoupled from TenantManagement DB tables.
/// Evaluates user permissions using Dashboard's native AmsRole and UserRoleAssignment records.
/// </summary>
public class DashboardUserAuthorizationService(
    ApplicationDbContext dbContext,
    IMemoryCache memoryCache) : IUserAuthorizationService
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

        var cacheKey = $"{cacheKeyPrefix}{externalIdentityId.Trim().ToLowerInvariant()}";

        if (memoryCache.TryGetValue(cacheKey, out HashSet<string>? cachedPerms) && cachedPerms != null)
        {
            return cachedPerms;
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

            // Fallback: If active user has no explicit operational roles assigned, grant default "Employee / Viewer" permissions
            if (permissionsSet.Count == 0 && dbContext.Users != null)
            {
                var userExists = await dbContext.Users
                    .AsNoTracking()
                    .AnyAsync(u => !u.IsDeleted && u.IsActive &&
                                   (u.ExternalIdentityId == externalIdentityId ||
                                    u.Username == externalIdentityId ||
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
