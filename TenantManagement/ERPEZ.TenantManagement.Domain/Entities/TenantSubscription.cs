using ERPEZ.TenantManagement.Domain.Common;
using Sieve.Attributes;
using System.Text.Json.Serialization;

namespace ERPEZ.TenantManagement.Domain.Entities;

public class TenantSubscription : BaseEntity
{ 
    public TenantSubscription() { }
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid TenantId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public int Amount { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public int Plan { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime StartDate { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime EndDate { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public int Status { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public int BillingCycle { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public bool AutoRenew { get; set; }
    [JsonIgnore]
    public virtual Tenant Tenant { get; set; } = null!;
}
