using ERPEZ.TenantManagement.Domain.Common;
using ERPEZ.TenantManagement.Domain.Enums;
using Sieve.Attributes;
using System.Text.Json.Serialization;

namespace ERPEZ.TenantManagement.Domain.Entities;

public class TenantInvoice : BaseEntity
{
    public TenantInvoice() { }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid TenantId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? TenantSubscriptionId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string InvoiceNumber { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string PlanName { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public BillingCycle BillingCycle { get; set; } = BillingCycle.Monthly;

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime InvoiceDate { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime DueDate { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime? PaidDate { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal SubtotalAmount { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal TaxRate { get; set; } = 0.12m;

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal TaxAmount { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal TotalAmount { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string Currency { get; set; } = "USD";

    [Sieve(CanFilter = true, CanSort = true)]
    public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;

    public string? PaymentMethodSummary { get; set; }

    [JsonIgnore]
    public virtual Tenant Tenant { get; set; } = null!;

    [JsonIgnore]
    public virtual TenantSubscription? TenantSubscription { get; set; }

    public virtual List<TenantInvoiceItem> Items { get; set; } = [];
}
