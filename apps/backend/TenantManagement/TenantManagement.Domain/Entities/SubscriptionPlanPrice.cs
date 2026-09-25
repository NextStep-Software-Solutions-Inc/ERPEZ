using ERPEZ.TenantManagement.Domain.Common;
using Sieve.Attributes;
using System.Text.Json.Serialization;

namespace ERPEZ.TenantManagement.Domain.Entities;

/// <summary>
/// Represents a versioned price schedule for a subscription plan with chronological effective dates.
/// Invariant: Modifications create new price versions; existing subscriber contracts are preserved.
/// </summary>
public class SubscriptionPlanPrice : BaseEntity
{
    public SubscriptionPlanPrice() { }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid SubscriptionPlanId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal MonthlyPrice { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal AnnualPrice { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string Currency { get; set; } = "PHP";

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime EffectiveFromUtc { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime? EffectiveToUtc { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsDefault { get; set; }

    // Navigation properties
    [JsonIgnore]
    public virtual SubscriptionPlan SubscriptionPlan { get; set; } = null!;
    public virtual List<TenantSubscription> Subscriptions { get; set; } = [];
}
