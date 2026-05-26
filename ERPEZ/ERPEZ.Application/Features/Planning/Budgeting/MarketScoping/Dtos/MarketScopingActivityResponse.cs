namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Dtos;

/// <summary>
/// Response DTO for market scoping activity.
/// </summary>
public record MarketScopingActivityResponse
{
    public Guid Id { get; set; }
    public Guid ActivityId { get; set; }
    public List<MarketScopingActivityAttachmentResponse> Attachments { get; set; } = [];
}
