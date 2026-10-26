namespace ERPEZ.TenantManagement.Application.Features.Inquiries.Common;

public class QuoteInquiryDto
{
    public string ReferenceCode { get; set; } = string.Empty;
    public string ContactName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string OrganizationName { get; set; } = string.Empty;
    public string TeamSize { get; set; } = string.Empty;
    public string PlanName { get; set; } = string.Empty;
    public string Tier { get; set; } = string.Empty;
    public string DeploymentType { get; set; } = string.Empty;
    public List<string> RequestedModules { get; set; } = [];
    public string ScopeSummary { get; set; } = string.Empty;
    public string EstimatedDelivery { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending Review";
    public DateTime SubmittedAtUtc { get; set; } = DateTime.UtcNow;
}

public class DemoInquiryDto
{
    public string ReferenceCode { get; set; } = string.Empty;
    public string ContactName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string OrganizationName { get; set; } = string.Empty;
    public string PreferredDate { get; set; } = string.Empty;
    public string PreferredTimeSlot { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public string Status { get; set; } = "Confirmed";
    public DateTime SubmittedAtUtc { get; set; } = DateTime.UtcNow;
}

public class SubscriberInquiryDto
{
    public string Email { get; set; } = string.Empty;
    public string Source { get; set; } = "Landing Page Footer";
    public string Status { get; set; } = "Active";
    public DateTime SubscribedAtUtc { get; set; } = DateTime.UtcNow;
}

public class InquiriesSummaryDto
{
    public List<QuoteInquiryDto> Quotes { get; set; } = [];
    public List<DemoInquiryDto> Demos { get; set; } = [];
    public List<SubscriberInquiryDto> Subscribers { get; set; } = [];
}
