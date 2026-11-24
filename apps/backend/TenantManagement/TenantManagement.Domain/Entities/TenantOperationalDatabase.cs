using ERPEZ.Shared.Enums;
using ERPEZ.TenantManagement.Domain.Common;

namespace ERPEZ.TenantManagement.Domain.Entities;

/// <summary>
/// Dedicated secure storage entity for tenant operational database credentials and provisioning status.
/// Keeps operational credentials strictly segregated from business TenantSettings.
/// </summary>
public class TenantOperationalDatabase : BaseEntity
{
    public Guid TenantId { get; set; }
    public virtual Tenant? Tenant { get; set; }
    public string DatabaseServer { get; set; } = string.Empty;
    public string DatabaseName { get; set; } = string.Empty;
    public string EncryptedConnectionString { get; set; } = string.Empty;
    public int EncryptionKeyVersion { get; set; } = 1;
    public TenantProvisioningState ProvisioningState { get; set; } = TenantProvisioningState.Pending;
    public DateTime? ProvisionedAtUtc { get; set; }
    public DateTime? LastAttemptedAtUtc { get; set; }
    public int RetryCount { get; set; } = 0;
    public string? LastError { get; set; }
}
