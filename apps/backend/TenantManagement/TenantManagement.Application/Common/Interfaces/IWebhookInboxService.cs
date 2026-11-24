namespace ERPEZ.TenantManagement.Application.Common.Interfaces;

public enum WebhookIngestionStatus
{
    Accepted,
    Duplicate
}

public interface IWebhookInboxService
{
    Task<WebhookIngestionStatus> IngestAsync(string svixId, string payloadJson, CancellationToken ct = default);
    Task ProcessPendingBatchAsync(int batchSize = 10, CancellationToken ct = default);
    Task<bool> ProcessSingleRecordAsync(long recordId, CancellationToken ct = default);
}
