using ERPEZ.TenantManagement.Domain.Common;
using Sieve.Attributes;
using System.Text.Json.Serialization;

namespace ERPEZ.TenantManagement.Domain.Entities;

/// <summary>
/// Normalizes module entitlements associated with a subscription plan tier.
/// </summary>
public class SubscriptionPlanModule : BaseEntity
{
    public SubscriptionPlanModule() { }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid SubscriptionPlanId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string ModuleCode { get; set; } = string.Empty;

    // Navigation properties
    [JsonIgnore]
    public virtual SubscriptionPlan SubscriptionPlan { get; set; } = null!;
}
