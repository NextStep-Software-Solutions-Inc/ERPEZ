using Microsoft.Extensions.DependencyInjection;

namespace ERPEZ.Shared.Interfaces;

/// <summary>
/// Factory for creating isolated IServiceScope instances pre-configured with tenant or global context.
/// Ensures fail-closed invariants are satisfied before ApplicationDbContext or other scoped services are requested.
/// </summary>
public interface ITenantScopeFactory
{
    /// <summary>
    /// Creates an AsyncServiceScope and activates the specified tenant context.
    /// </summary>
    Task<AsyncServiceScope> CreateTenantScopeAsync(Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates an AsyncServiceScope and activates global system context.
    /// </summary>
    Task<AsyncServiceScope> CreateGlobalScopeAsync(CancellationToken cancellationToken = default);
}
