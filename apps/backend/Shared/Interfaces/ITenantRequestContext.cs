using ERPEZ.Shared.Models;

namespace ERPEZ.Shared.Interfaces;

/// <summary>
/// Scoped mutable contract consumed exclusively by the middleware pipeline
/// to initialize validated tenant context and infrastructure connection parameters.
/// </summary>
public interface ITenantRequestContext : ITenantContextService
{
    /// <summary>
    /// The resolved database connection descriptor, inaccessible outside the infrastructure layer.
    /// </summary>
    TenantDatabaseConnectionInfo? ConnectionInfo { get; }

    /// <summary>
    /// Initializes the request context upon successful authorization and credential pre-resolution.
    /// </summary>
    void Initialize(TenantAccessContext accessContext, TenantDatabaseConnectionInfo connectionInfo);
}
