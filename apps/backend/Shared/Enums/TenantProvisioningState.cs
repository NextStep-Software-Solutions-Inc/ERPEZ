namespace ERPEZ.Shared.Enums;

/// <summary>
/// Lifecycle states for a tenant and its dedicated physical database.
/// </summary>
public enum TenantProvisioningState
{
    Provisioning = 0,
    Ready = 1,
    Failed = 2,
    Disabled = 3,
    Maintenance = 4
}
