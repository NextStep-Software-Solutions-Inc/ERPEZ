using ERPEZ.TenantManagement.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.TenantManagement.Domain.Entities;

public class TenantSubscription : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid TenantId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public int Amount { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string Plan { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime StartDate { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime EndDate { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string Status { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public string? BillingCycle { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public bool AutoRenew { get; set; }

    public virtual List<Tenant> Tenants { get; set; } = null!;
}
