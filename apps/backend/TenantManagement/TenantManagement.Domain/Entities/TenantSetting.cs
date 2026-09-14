using ERPEZ.TenantManagement.Domain.Common;
using Sieve.Attributes;
using System.Text.Json.Serialization;

namespace ERPEZ.TenantManagement.Domain.Entities;

public class TenantSetting : BaseEntity
{
    public TenantSetting() { }
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid TenantId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public bool OnPremise { get; set; }
    public string BaseURL { get; set; } = string.Empty;
    public string DbConnectionString { get; set; } = string.Empty;
    public string BillingContactEmail { get; set; } = string.Empty;
    public string? BillingAddress { get; set; }
    public string? BillingCity { get; set; }
    public string? BillingCountry { get; set; }
    public string? BillingPostalCode { get; set; }
    public string? TaxId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string AllowedDomain { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public int MaxAllowedTenants { get; set; } = 1;
    [JsonIgnore]
    public virtual Tenant Tenant { get; set; } = null!;
}
