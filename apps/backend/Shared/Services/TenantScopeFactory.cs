using ERPEZ.Shared.Interfaces;
using Microsoft.Extensions.DependencyInjection;

namespace ERPEZ.Shared.Services;

/// <summary>
/// Creates scoped service containers with validated tenant or global context initialized
/// prior to returning the scope to the caller.
/// </summary>
public class TenantScopeFactory(IServiceScopeFactory scopeFactory) : ITenantScopeFactory
{
    public async Task<AsyncServiceScope> CreateTenantScopeAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var scope = scopeFactory.CreateAsyncScope();
        try
        {
            var activator = scope.ServiceProvider.GetRequiredService<ITenantBackgroundScopeActivator>();
            await activator.ActivateTenantAsync(tenantId, cancellationToken);
            return scope;
        }
        catch
        {
            await scope.DisposeAsync();
            throw;
        }
    }

    public async Task<AsyncServiceScope> CreateGlobalScopeAsync(CancellationToken cancellationToken = default)
    {
        var scope = scopeFactory.CreateAsyncScope();
        try
        {
            var activator = scope.ServiceProvider.GetRequiredService<ITenantBackgroundScopeActivator>();
            await activator.ActivateGlobalAsync(cancellationToken);
            return scope;
        }
        catch
        {
            await scope.DisposeAsync();
            throw;
        }
    }
}
