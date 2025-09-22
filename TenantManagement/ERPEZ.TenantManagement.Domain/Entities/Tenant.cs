using ERPEZ.TenantManagement.Domain.Common;

namespace ERPEZ.TenantManagement.Domain.Entities;

public class Tenant : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public bool OnPremise { get; set; }
    public string BillingContactEmail { get; set; } = string.Empty;
    public virtual List<TenantModule> TenantModules { get; set; } = [];
    public virtual List<TenantSettings> TenantSettings { get; set; } = [];
    public virtual List<TenantSubscription> TenantSubscriptions { get; set; } = [];
}
