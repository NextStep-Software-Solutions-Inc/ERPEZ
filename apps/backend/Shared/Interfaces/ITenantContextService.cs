namespace ERPEZ.Shared.Interfaces;

/// <summary>
/// Service contract for resolving the active tenant context of the current request.
/// </summary>
public interface ITenantContextService
{
    /// <summary>
    /// The unique identifier of the active tenant, or null if unauthenticated / global.
    /// </summary>
    Guid? TenantId { get; }

    /// <summary>
    /// Indicates whether the tenant context was successfully resolved for the current request.
    /// </summary>
    bool IsResolved { get; }

    /// <summary>
    /// Sets the active tenant ID for the current request scope.
    /// </summary>
    void SetTenantId(Guid tenantId);
}
