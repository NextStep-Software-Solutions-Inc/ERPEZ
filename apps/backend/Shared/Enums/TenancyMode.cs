namespace ERPEZ.Shared.Enums;

/// <summary>
/// Defines the operational deployment and data isolation topology for a tenant.
/// </summary>
public enum TenancyMode
{
    /// <summary>
    /// Shared operational database with logical row-level isolation via TenantId.
    /// Default for standard Cloud SaaS organizations.
    /// </summary>
    SaaS = 1,

    /// <summary>
    /// Dedicated physical PostgreSQL database per tenant (e.g. erpez_tenant_{tenantId}).
    /// Provisioned for enterprise sovereign and air-gapped on-premise deployments.
    /// </summary>
    OnPremise = 2
}
