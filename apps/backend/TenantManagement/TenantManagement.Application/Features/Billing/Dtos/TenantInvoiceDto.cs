namespace ERPEZ.TenantManagement.Application.Features.Billing.Dtos;

public class TenantInvoiceItemDto
{
    public Guid Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
}

public class TenantInvoiceDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid? TenantSubscriptionId { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public string PlanName { get; set; } = string.Empty;
    public string BillingCycle { get; set; } = string.Empty;
    public DateTime InvoiceDate { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime? PaidDate { get; set; }
    public decimal SubtotalAmount { get; set; }
    public decimal TaxRate { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public string Currency { get; set; } = "USD";
    public string Status { get; set; } = string.Empty;
    public string? PaymentMethodSummary { get; set; }
    public List<TenantInvoiceItemDto> Items { get; set; } = [];
}
