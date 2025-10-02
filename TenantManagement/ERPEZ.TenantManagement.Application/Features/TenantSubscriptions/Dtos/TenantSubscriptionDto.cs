namespace ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Dtos;

public class TenantSubscriptionDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public int Amount { get; set; }
    public string Plan { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string BillingCycle { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool AutoRenew { get; set; }
}
