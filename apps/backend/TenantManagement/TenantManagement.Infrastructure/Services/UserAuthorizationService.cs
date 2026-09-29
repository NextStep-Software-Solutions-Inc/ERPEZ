using ERPEZ.Shared.Interfaces;
using ERPEZ.TenantManagement.Domain.Constants;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace ERPEZ.TenantManagement.Infrastructure.Services;

/// <summary>
/// Implementation of IUserAuthorizationService utilizing TenantManagement DB and IMemoryCache.
/// Resolves permissions in-memory via TenantManagementPermissionsRegistry without permission database tables.
/// Enforces fail-closed validation, cross-tenant isolation, and local node cache invalidation.
/// </summary>
public class UserAuthorizationService(
    ApplicationDbContext dbContext,
    IMemoryCache memoryCache) : IUserAuthorizationService
{
    private const string cacheKeyPrefix = "perms:";
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

        var tenantKey = tenantId?.ToString() ?? "platform";
        var cacheKey = $"{cacheKeyPrefix}{tenantKey}:{externalIdentityId}";

        if (memoryCache.TryGetValue(cacheKey, out HashSet<string>? cachedPerms) && cachedPerms != null)
        {
            return cachedPerms;
        }

        var permissionsSet = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        // 1. Resolve Platform Scope Roles (if any active platform role assignment exists)
        var platformRoles = await dbContext.TenantMembers!
            .AsNoTracking()
            .Where(tm => (tm.ExternalIdentityId == externalIdentityId || tm.UserId == externalIdentityId) &&
                         tm.Status == Status.Active &&
                         !tm.IsDeleted)
            .SelectMany(tm => tm.RoleAssignments)
            .Select(ra => ra.Role)
            .Where(r => !r.IsDeleted && r.Scope == RoleScope.Platform)
            .Select(r => r.Name)
            .Distinct()
            .ToListAsync(cancellationToken);

        if (platformRoles.Count > 0)
        {
            var platformPerms = TenantManagementPermissionsRegistry.GetPermissionsForRoles(platformRoles);
            foreach (var p in platformPerms)
            {
                permissionsSet.Add(p);
            }
        }

        // 2. Resolve Tenant Scope Roles (strictly isolated to the requested tenantId)
        if (tenantId.HasValue)
        {
            var assignedTenantRoles = await dbContext.TenantMembers!
                .AsNoTracking()
                .Where(tm => (tm.ExternalIdentityId == externalIdentityId || tm.UserId == externalIdentityId) &&
                             tm.TenantId == tenantId.Value &&
                             tm.Status == Status.Active &&
                             !tm.IsDeleted)
                .SelectMany(tm => tm.RoleAssignments)
                .Select(ra => ra.Role)
                .Where(r => !r.IsDeleted && r.Scope == RoleScope.Tenant)
                .Select(r => new { r.Name, r.Permissions })
                .ToListAsync(cancellationToken);

            // Resolve permissions from hardcoded registry
            var roleNames = assignedTenantRoles.Select(r => r.Name);
            var registryPermissions = TenantManagementPermissionsRegistry.GetPermissionsForRoles(roleNames);
            foreach (var p in registryPermissions)
            {
                permissionsSet.Add(p);
            }

            // Append custom role permissions if defined
            foreach (var role in assignedTenantRoles)
            {
                if (role.Permissions != null && role.Permissions.Count > 0)
                {
                    foreach (var p in role.Permissions)
                    {
                        permissionsSet.Add(p);
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

        var tenantKey = tenantId?.ToString() ?? "platform";
        var cacheKey = $"{cacheKeyPrefix}{tenantKey}:{externalIdentityId}";
        memoryCache.Remove(cacheKey);

        // Also invalidate platform cache if tenant-scoped
        if (tenantId.HasValue)
        {
            memoryCache.Remove($"{cacheKeyPrefix}platform:{externalIdentityId}");
        }
    }
}
