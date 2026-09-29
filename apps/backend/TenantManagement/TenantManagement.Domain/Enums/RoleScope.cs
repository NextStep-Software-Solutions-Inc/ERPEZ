namespace ERPEZ.TenantManagement.Domain.Enums;

/// <summary>
/// Architectural domain classification for functional roles.
/// RoleScope determines which application surface manages and displays a role.
/// Invariant: Scope is a taxonomy filter and does not confer authorization by itself.
/// Converted to string in database persistence.
/// </summary>
public enum RoleScope
{
    /// <summary>
    /// Unclassified or pending audit. Fails closed in all assignment APIs.
    /// </summary>
    Unknown = 0,

    /// <summary>
    /// Platform administration, tenant fleet oversight, and global system configuration.
    /// </summary>
    Platform = 1,

    /// <summary>
    /// SaaS account governance, workspace settings, billing, subscription, and member management.
    /// </summary>
    Tenant = 2
}
