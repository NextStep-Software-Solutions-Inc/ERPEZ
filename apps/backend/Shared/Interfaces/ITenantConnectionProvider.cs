namespace ERPEZ.Shared.Interfaces;

/// <summary>
/// Infrastructure provider consumed by EF Core to synchronously retrieve the pre-resolved
/// database connection string for the active tenant context.
/// </summary>
public interface ITenantConnectionProvider
{
    /// <summary>
    /// Returns the active connection string. Fails closed if the tenant context is uninitialized.
    /// </summary>
    string GetConnectionString();
}
