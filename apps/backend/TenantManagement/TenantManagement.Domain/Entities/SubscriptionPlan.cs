using ERPEZ.TenantManagement.Domain.Common;
using ERPEZ.TenantManagement.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.TenantManagement.Domain.Entities;

/// <summary>
/// Represents a platform-wide commercial subscription plan tier defined by the System Owner.
/// </summary>
public class SubscriptionPlan : BaseEntity
{
    public SubscriptionPlan() { }

    [Sieve(CanFilter = true, CanSort = true)]
    public string Code { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Plan Tier { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public int MaxAllowedTenants { get; set; } = 1;

    [Sieve(CanFilter = true, CanSort = true)]
    public int MaxAllowedUsers { get; set; } = 10;

    [Sieve(CanFilter = true, CanSort = true)]
    public int MaxAllowedStorageGb { get; set; } = 10;

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public virtual List<SubscriptionPlanPrice> Prices { get; set; } = [];
    public virtual List<SubscriptionPlanModule> Modules { get; set; } = [];
}
