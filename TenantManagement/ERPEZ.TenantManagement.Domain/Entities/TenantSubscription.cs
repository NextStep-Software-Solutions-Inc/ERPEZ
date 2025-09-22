using ERPEZ.TenantManagement.Domain.Common;

namespace ERPEZ.TenantManagement.Domain.Entities;

public class TenantSubscription : BaseEntity
{
    public Guid TenantId { get; set; }
    public int Amount { get; set; }
    public string Plan { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? BillingCycle { get; set; }
    public bool AutoRenew { get; set; }

    public virtual Tenant Tenant { get; set; } = null!;
}
