namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Dtos;

/// <summary>
/// Request DTO for creating a market scoping activity.
/// </summary>
public record CreateMarketScopingActivityRequest
{
    public required Guid MarketScopingId { get; set; }
    public required Guid ActivityId { get; set; }
    public List<MarketScopingActivityAttachmentDto> Attachments { get; set; } = [];
}
