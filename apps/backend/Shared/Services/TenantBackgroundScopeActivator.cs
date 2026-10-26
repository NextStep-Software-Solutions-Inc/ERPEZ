using ERPEZ.Shared.Enums;
using ERPEZ.Shared.Interfaces;
using ERPEZ.Shared.Models;
using Microsoft.Extensions.Configuration;

namespace ERPEZ.Shared.Services;

/// <summary>
/// Authoritative background worker scope activator.
/// Resolves tenant connection parameters and initializes ITenantRequestContext
/// prior to ApplicationDbContext instantiation.
/// </summary>
public class TenantBackgroundScopeActivator(
    ITenantConnectionResolver connectionResolver,
    ITenantRequestContext requestContext,
    IConfiguration configuration) : ITenantBackgroundScopeActivator
{
    public async Task ActivateTenantAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        if (tenantId == Guid.Empty)
        {
            throw new ArgumentException("Tenant ID cannot be empty for tenant-scoped background execution.", nameof(tenantId));
        }

        var connectionInfo = await connectionResolver.ResolveConnectionInfoAsync(tenantId, cancellationToken);
        if (connectionInfo == null || string.IsNullOrWhiteSpace(connectionInfo.ConnectionString))
        {
            throw new InvalidOperationException($"Could not resolve operational database connection for tenant '{tenantId}'.");
        }

        var accessContext = new TenantAccessContext(
            TenantId: tenantId,
            TenantName: $"BackgroundWorker-{tenantId:N}",
            ProvisioningState: TenantProvisioningState.Ready,
            AllowedDomain: "*",
            LicenseStatus: "Active",
            TenancyMode: connectionInfo.TenancyMode);

        requestContext.Initialize(accessContext, connectionInfo);
    }

    public Task ActivateGlobalAsync(CancellationToken cancellationToken = default)
    {
        var sharedConnStr = configuration.GetConnectionString("OperationalConnection")
            ?? configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrWhiteSpace(sharedConnStr))
        {
            throw new InvalidOperationException("Could not resolve default operational connection for global background execution.");
        }

        var connectionInfo = new TenantDatabaseConnectionInfo(Guid.Empty, sharedConnStr);
        var accessContext = new TenantAccessContext(
            TenantId: Guid.Empty,
            TenantName: "GlobalSystemWorker",
            ProvisioningState: TenantProvisioningState.Ready,
            AllowedDomain: "*",
            LicenseStatus: "Active",
            TenancyMode: TenancyMode.SaaS);

        requestContext.Initialize(accessContext, connectionInfo);
        return Task.CompletedTask;
    }
}
