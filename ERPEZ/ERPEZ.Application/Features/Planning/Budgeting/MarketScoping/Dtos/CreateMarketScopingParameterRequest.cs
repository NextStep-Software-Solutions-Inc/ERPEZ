namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Dtos;

/// <summary>
/// Request DTO for creating a market scoping parameter.
/// </summary>
public record CreateMarketScopingParameterRequest
{
    public required Guid MarketScopingId { get; set; }
    public required Guid ParameterId { get; set; }
    public bool? IsConsidered { get; set; }
    public string? Remarks { get; set; }
    public List<MarketScopingParameterAttachmentDto> Attachments { get; set; } = [];
}
