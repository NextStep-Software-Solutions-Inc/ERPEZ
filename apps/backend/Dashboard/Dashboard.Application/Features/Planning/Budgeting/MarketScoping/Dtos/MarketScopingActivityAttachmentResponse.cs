namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Dtos;

/// <summary>
/// Response DTO for market scoping activity attachment.
/// </summary>
public record MarketScopingActivityAttachmentResponse
{
    public Guid Id { get; set; }
    public string FileUrl { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
}
