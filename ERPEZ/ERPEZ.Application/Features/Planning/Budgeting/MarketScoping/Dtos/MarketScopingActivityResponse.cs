namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Dtos;

/// <summary>
/// Response DTO for market scoping activity.
/// </summary>
public record MarketScopingActivityResponse
{
    public Guid Id { get; set; }
    public Guid ActivityId { get; set; }
    public string ActivityType { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<MarketScopingActivityAttachmentResponse> Attachments { get; set; } = [];
}
