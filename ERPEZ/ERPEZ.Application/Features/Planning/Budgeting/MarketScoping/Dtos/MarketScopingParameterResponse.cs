namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Dtos;

/// <summary>
/// Response DTO for market scoping parameter evaluation.
/// </summary>
public record MarketScopingParameterResponse
{
    public Guid Id { get; set; }
    public Guid ParameterId { get; set; }
    public bool? IsConsidered { get; set; }
    public string? Remarks { get; set; }
    public List<MarketScopingParameterAttachmentResponse> Attachments { get; set; } = [];
}
