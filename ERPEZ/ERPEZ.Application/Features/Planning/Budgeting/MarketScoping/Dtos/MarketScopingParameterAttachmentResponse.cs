namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Dtos;

/// <summary>
/// Response DTO for market scoping parameter attachment.
/// </summary>
public record MarketScopingParameterAttachmentResponse
{
    public Guid Id { get; set; }
    public string FileUrl { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
}
