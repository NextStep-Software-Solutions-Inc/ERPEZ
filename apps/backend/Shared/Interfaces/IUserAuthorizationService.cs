namespace ERPEZ.Shared.Interfaces;

/// <summary>
/// Service contract for resolving, checking, and invalidating user functional permissions.
/// </summary>
public interface IUserAuthorizationService
{
    /// <summary>
    /// Checks if a user has a specific functional permission within a tenant context.
    /// </summary>
    Task<bool> HasPermissionAsync(string externalIdentityId, Guid? tenantId, string permission, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves all functional permissions granted to a user within a tenant context.
    /// </summary>
    Task<IReadOnlySet<string>> GetPermissionsAsync(string externalIdentityId, Guid? tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Invalidates cached permissions for a user within a tenant context.
    /// </summary>
    void InvalidateUserPermissions(string externalIdentityId, Guid? tenantId);
}
