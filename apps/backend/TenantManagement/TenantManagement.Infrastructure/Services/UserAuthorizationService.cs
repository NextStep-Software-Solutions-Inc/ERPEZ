using ERPEZ.Shared.Interfaces;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace ERPEZ.TenantManagement.Infrastructure.Services;

/// <summary>
/// Implementation of IUserAuthorizationService utilizing TenantManagement DB and IMemoryCache.
/// Enforces fail-closed validation and local node cache invalidation.
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
        if (string.IsNullOrWhiteSpace(externalIdentityId) || !tenantId.HasValue || string.IsNullOrWhiteSpace(permission))
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
        if (string.IsNullOrWhiteSpace(externalIdentityId) || !tenantId.HasValue)
        {
            // Fail closed
            return new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        }

        var cacheKey = $"{cacheKeyPrefix}{tenantId.Value}:{externalIdentityId}";

        if (memoryCache.TryGetValue(cacheKey, out HashSet<string>? cachedPerms) && cachedPerms != null)
        {
            return cachedPerms;
        }

        // Query TenantManagement database
        var rawPermissions = await dbContext.TenantMembers!
            .AsNoTracking()
            .Where(tm => tm.ExternalIdentityId == externalIdentityId &&
                         tm.TenantId == tenantId.Value &&
                         tm.Status == Status.Active &&
                         !tm.IsDeleted)
            .SelectMany(tm => tm.RoleAssignments)
            .Select(ra => ra.Role)
            .Where(r => !r.IsDeleted)
            .SelectMany(r => r.RolePermissions)
            .Select(rp => rp.Permission)
            .Where(p => !p.IsDeleted)
            .Select(p => p.Key)
            .Distinct()
            .ToListAsync(cancellationToken);

        var permissionsSet = new HashSet<string>(rawPermissions, StringComparer.OrdinalIgnoreCase);

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
        if (string.IsNullOrWhiteSpace(externalIdentityId) || !tenantId.HasValue)
        {
            return;
        }

        var cacheKey = $"{cacheKeyPrefix}{tenantId.Value}:{externalIdentityId}";
        memoryCache.Remove(cacheKey);
    }
}
