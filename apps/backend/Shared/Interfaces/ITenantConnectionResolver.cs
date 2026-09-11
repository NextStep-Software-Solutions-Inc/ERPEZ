using ERPEZ.Shared.Models;

namespace ERPEZ.Shared.Interfaces;

/// <summary>
/// Asynchronous resolver for acquiring and decrypting operational database connection metadata.
/// Invoked strictly after tenant access and membership authorization has succeeded.
/// </summary>
public interface ITenantConnectionResolver
{
    /// <summary>
    /// Asynchronously resolves and decrypts the operational database connection descriptor for an authorized tenant.
    /// </summary>
    Task<TenantDatabaseConnectionInfo?> ResolveConnectionInfoAsync(
        Guid authorizedTenantId,
        CancellationToken cancellationToken = default);
}
