using ERPEZ.TenantManagement.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.TenantManagement.Domain.Entities;

public class Tenant : BaseEntity
{
    public Tenant() { }
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public string? Description { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsDisabled { get; set; } = false;
    [Sieve(CanFilter = true, CanSort = true)]
    public ERPEZ.Shared.Enums.TenantProvisioningState ProvisioningState { get; set; } = ERPEZ.Shared.Enums.TenantProvisioningState.Ready;
    public virtual List<Module> Modules { get; set; } = [];
    public virtual TenantSetting TenantSetting { get; set; } = null!;
    public virtual List<TenantSubscription> TenantSubscriptions { get; set; } = [];
    public virtual List<TenantMember> TenantMembers { get; set; } = [];
    public virtual List<LicenseKey> LicenseKeys { get; set; } = [];
    public virtual List<TenantInvoice> TenantInvoices { get; set; } = [];
    public virtual List<TenantPaymentMethod> TenantPaymentMethods { get; set; } = [];
    public virtual TenantOperationalDatabase? OperationalDatabase { get; set; }
}
