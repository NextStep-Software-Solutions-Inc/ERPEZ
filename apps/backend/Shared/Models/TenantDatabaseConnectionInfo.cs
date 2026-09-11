namespace ERPEZ.Shared.Models;

/// <summary>
/// Infrastructure descriptor holding validated connection parameters for a tenant database.
/// Strictly separated from general application authorization context.
/// </summary>
public sealed record TenantDatabaseConnectionInfo(
    Guid TenantId,
    string ConnectionString,
    int MaxPoolSize = 50,
    int ConnectionTimeoutSeconds = 15
);
