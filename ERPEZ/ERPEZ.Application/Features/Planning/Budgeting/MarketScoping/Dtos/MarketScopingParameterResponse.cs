namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Dtos;

/// <summary>
/// Response DTO for market scoping parameter evaluation.
/// </summary>
public record MarketScopingParameterResponse
{
    public Guid Id { get; set; }
    public Guid ParameterId { get; set; }
    public string ParameterName { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string GuidedQuestion { get; set; } = string.Empty;
    public bool? IsConsidered { get; set; }
    public string? Remarks { get; set; }
    public List<MarketScopingParameterAttachmentResponse> Attachments { get; set; } = [];
}
