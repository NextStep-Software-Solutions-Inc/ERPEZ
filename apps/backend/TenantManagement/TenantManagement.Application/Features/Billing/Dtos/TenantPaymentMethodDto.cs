namespace ERPEZ.TenantManagement.Application.Features.Billing.Dtos;

public class TenantPaymentMethodDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string? Brand { get; set; }
    public string Last4 { get; set; } = string.Empty;
    public int ExpiryMonth { get; set; }
    public int ExpiryYear { get; set; }
    public string CardholderName { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateTenantPaymentMethodDto
{
    public string Type { get; set; } = "credit_card";
    public string CardNumber { get; set; } = string.Empty;
    public string CardholderName { get; set; } = string.Empty;
    public int ExpiryMonth { get; set; }
    public int ExpiryYear { get; set; }
    public string? Cvc { get; set; }
    public bool SetAsDefault { get; set; }
}
