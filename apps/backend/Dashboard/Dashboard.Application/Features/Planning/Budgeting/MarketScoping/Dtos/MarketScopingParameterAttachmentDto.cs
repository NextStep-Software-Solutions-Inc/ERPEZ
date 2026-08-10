namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Dtos;

/// <summary>
/// DTO for creating or updating a market scoping parameter attachment.
/// </summary>
public record MarketScopingParameterAttachmentDto
{
    public string FileUrl { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
}
