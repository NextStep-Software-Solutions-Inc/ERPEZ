using ERPEZ.TenantManagement.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.TenantManagement.Domain.Entities;

public sealed class Tenant : BaseEntity
{
    public Tenant() { }
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public bool OnPremise { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string BillingContactEmail { get; set; } = string.Empty;
    public List<Module> Modules { get; set; } = [];
    public List<TenantSetting> TenantSettings { get; set; } = [];
    public List<TenantSubscription> TenantSubscriptions { get; set; } = [];
}
