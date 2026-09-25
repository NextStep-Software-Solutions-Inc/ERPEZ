namespace ERPEZ.TenantManagement.Domain.Enums;

/// <summary>
/// Architectural domain classification for functional roles.
/// RoleScope determines which application surface manages and displays a role.
/// Invariant: Scope is a taxonomy filter and does not confer authorization by itself.
/// </summary>
public enum RoleScope
{
    /// <summary>
    /// Unclassified or pending audit. Fails closed in all assignment APIs.
    /// </summary>
    Unknown = 0,

    /// <summary>
    /// SaaS account governance, billing, subscription, and organization profile management.
    /// Managed strictly via Tenant Management App.
    /// </summary>
    TenantManagement = 1,

    /// <summary>
    /// Internal ERP operations, planning, procurement, budgeting, and document approval workflows.
    /// Managed strictly via ERP Dashboard App.
    /// </summary>
    Operational = 2,

    /// <summary>
    /// External third-party actors (e.g., registered bidders, contractors, suppliers).
    /// Managed strictly via Supplier / Vendor Portal.
    /// </summary>
    ExternalPortal = 3
}
