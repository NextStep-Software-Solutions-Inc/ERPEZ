using ERPEZ.Shared.Models;

namespace ERPEZ.Shared.Interfaces;

/// <summary>
/// Authoritative service for activating tenant or global system context
/// inside asynchronous background jobs, queue consumers, and hosted services
/// before any operational database interaction.
/// </summary>
public interface ITenantBackgroundScopeActivator
{
    /// <summary>
    /// Activates tenant context for the specified tenant ID, resolving connection metadata and setting ITenantRequestContext.
    /// </summary>
    Task ActivateTenantAsync(Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Activates global system context (shared operational DB, no tenant filter) for non-tenant background jobs.
    /// </summary>
    Task ActivateGlobalAsync(CancellationToken cancellationToken = default);
}
