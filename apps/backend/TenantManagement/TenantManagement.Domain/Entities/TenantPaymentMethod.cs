using ERPEZ.TenantManagement.Domain.Common;
using ERPEZ.TenantManagement.Domain.Enums;
using Sieve.Attributes;
using System.Text.Json.Serialization;

namespace ERPEZ.TenantManagement.Domain.Entities;

public class TenantPaymentMethod : BaseEntity
{
    public TenantPaymentMethod() { }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid TenantId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public PaymentMethodType Type { get; set; } = PaymentMethodType.CreditCard;

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Brand { get; set; }

    public string Last4 { get; set; } = string.Empty;

    public int ExpiryMonth { get; set; }

    public int ExpiryYear { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string CardholderName { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsDefault { get; set; } = false;

    [JsonIgnore]
    public virtual Tenant Tenant { get; set; } = null!;
}
