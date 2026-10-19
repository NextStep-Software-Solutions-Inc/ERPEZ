using ERPEZ.Shared.Enums;

namespace ERPEZ.Shared.Models;

/// <summary>
/// Infrastructure descriptor holding validated connection parameters for a tenant database.
/// Strictly separated from general application authorization context.
/// </summary>
public sealed record TenantDatabaseConnectionInfo(
    Guid TenantId,
    string ConnectionString,
    TenancyMode TenancyMode = TenancyMode.SaaS,
    int MaxPoolSize = 50,
    int ConnectionTimeoutSeconds = 15
);
