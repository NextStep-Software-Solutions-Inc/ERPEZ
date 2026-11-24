using ERPEZ.Shared.Enums;

namespace ERPEZ.TenantManagement.Domain.Entities;

public class WebhookInboxRecord
{
    public long Id { get; set; }
    public IdentityProvider Provider { get; set; } = IdentityProvider.Clerk;
    public string SvixMessageId { get; set; } = string.Empty;
    public string ProviderEventId { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;
    public string PayloadJson { get; set; } = string.Empty;
    public DateTime ReceivedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? ProcessedAtUtc { get; set; }
    public WebhookProcessingStatus Status { get; set; } = WebhookProcessingStatus.Pending;
    public int AttemptCount { get; set; } = 0;
    public DateTime? LastAttemptedAtUtc { get; set; }
    public DateTime? LeaseExpiresAtUtc { get; set; }
    public string? LastError { get; set; }
}
