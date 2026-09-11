namespace ERPEZ.TenantManagement.Application.Features.Billing.Dtos;

public class TenantBillingContactDto
{
    public string CompanyName { get; set; } = string.Empty;
    public string BillingEmail { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }
    public string? TaxId { get; set; }
}

public class ProcessInvoicePaymentDto
{
    public Guid PaymentMethodId { get; set; }
}
