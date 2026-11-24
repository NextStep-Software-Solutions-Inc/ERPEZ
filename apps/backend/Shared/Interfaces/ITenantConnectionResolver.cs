using ERPEZ.Shared.Enums;
using ERPEZ.Shared.Models;

namespace ERPEZ.Shared.Interfaces;

/// <summary>
/// Asynchronous resolver for acquiring and decrypting operational database connection metadata.
/// Invoked strictly after tenant access and membership authorization has succeeded.
/// </summary>
public interface ITenantConnectionResolver
{
    /// <summary>
    /// Asynchronously resolves operational database connection descriptor for an authorized tenant.
    /// </summary>
    Task<TenantDatabaseConnectionInfo?> ResolveConnectionInfoAsync(
        Guid authorizedTenantId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Asynchronously resolves operational database connection descriptor for an authorized tenant,
    /// optimizing resolution based on known TenancyMode.
    /// </summary>
    Task<TenantDatabaseConnectionInfo?> ResolveConnectionInfoAsync(
        Guid authorizedTenantId,
        TenancyMode? tenancyMode,
        CancellationToken cancellationToken = default) => ResolveConnectionInfoAsync(authorizedTenantId, cancellationToken);

    /// <summary>
    /// Explicitly evicts cached connection metadata for the specified tenant.
    /// Triggered on credential rotation, tenancy mode changes, or tenant deactivation.
    /// </summary>
    void InvalidateConnection(Guid tenantId);
}
