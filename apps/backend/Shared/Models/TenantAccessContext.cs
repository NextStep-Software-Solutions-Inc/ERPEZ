using ERPEZ.Shared.Enums;

namespace ERPEZ.Shared.Models;

/// <summary>
/// Safe tenant governance and authorization context.
/// Contains identity, lifecycle status, and policy constraints.
/// Does NOT contain any database connection strings or infrastructure credentials.
/// </summary>
public record TenantAccessContext(
    Guid TenantId,
    string TenantName,
    TenantProvisioningState ProvisioningState,
    string AllowedDomain,
    string LicenseStatus,
    TenancyMode TenancyMode = TenancyMode.SaaS
);
