using ERPEZ.Shared.Models;

namespace ERPEZ.Shared.Interfaces;

/// <summary>
/// Read-only service contract for accessing the active tenant context of the current request.
/// Strictly partitioned from database credentials and infrastructure connection parameters.
/// </summary>
public interface ITenantContextService
{
    /// <summary>
    /// The unique identifier of the active tenant, or null if unauthenticated or global.
    /// </summary>
    Guid? TenantId { get; }

    /// <summary>
    /// Indicates whether the tenant context was successfully validated and resolved for the current request.
    /// </summary>
    bool IsResolved { get; }

    /// <summary>
    /// Safe tenant governance and lifecycle context.
    /// </summary>
    TenantAccessContext? AccessContext { get; }
}
