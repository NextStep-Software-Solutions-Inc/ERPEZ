namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Dtos;

/// <summary>
/// DTO for creating or updating a market scoping activity.
/// </summary>
public record MarketScopingActivityDto
{
    public Guid ActivitySettingsId { get; set; }
    public Guid ActivityId { get; set; }
    public List<MarketScopingActivityAttachmentDto> Attachments { get; set; } = [];
}
