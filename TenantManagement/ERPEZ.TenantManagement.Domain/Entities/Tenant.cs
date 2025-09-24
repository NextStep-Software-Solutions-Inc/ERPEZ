using ERPEZ.TenantManagement.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.TenantManagement.Domain.Entities;

public class Tenant : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public bool OnPremise { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string BillingContactEmail { get; set; } = string.Empty;
    public virtual List<TenantModule> TenantModules { get; set; } = [];
    public virtual List<TenantSetting> TenantSettings { get; set; } = [];
    public virtual List<TenantSubscription> TenantSubscriptions { get; set; } = [];
}
