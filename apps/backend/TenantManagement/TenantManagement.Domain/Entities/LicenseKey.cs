using ERPEZ.TenantManagement.Domain.Common;
using ERPEZ.TenantManagement.Domain.Enums;
using Sieve.Attributes;
using System.Text.Json.Serialization;

namespace ERPEZ.TenantManagement.Domain.Entities;

public class LicenseKey : BaseEntity
{
    public LicenseKey() { }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? TenantId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? TenantSubscriptionId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string Key { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string Prefix { get; set; } = "EPZ";

    [Sieve(CanFilter = true, CanSort = true)]
    public string BoundEmail { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public Plan Plan { get; set; } = Plan.OnPremise;

    [Sieve(CanFilter = true, CanSort = true)]
    public string AllowedDomain { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public int MaxTenants { get; set; } = 1;

    [Sieve(CanFilter = true, CanSort = true)]
    public int MaxUsers { get; set; } = 50;

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime IssuedAt { get; set; } = DateTime.UtcNow;

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime ExpiresAt { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public LicenseStatus Status { get; set; } = LicenseStatus.Active;

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsAirGapped { get; set; } = false;

    public string Signature { get; set; } = string.Empty;

    public DateTime? ActivatedAt { get; set; }

    public string? Notes { get; set; }

    [JsonIgnore]
    public virtual Tenant? Tenant { get; set; }

    [JsonIgnore]
    public virtual TenantSubscription? TenantSubscription { get; set; }
}
