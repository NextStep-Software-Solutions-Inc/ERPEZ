namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Dtos;

/// <summary>
/// Response DTO for market scoping status history entry.
/// </summary>
public record MarketScopingHistoryResponse
{
    public Guid Id { get; set; }
    public Guid MarketScopingId { get; set; }
    public string PreviousStatus { get; set; } = string.Empty;
    public string NewStatus { get; set; } = string.Empty;
    public string? ChangeReason { get; set; }
    public DateTime ChangedAt { get; set; }
    public string ChangedBy { get; set; } = string.Empty;
}
