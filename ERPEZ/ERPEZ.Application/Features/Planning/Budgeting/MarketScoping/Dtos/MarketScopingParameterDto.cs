namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Dtos;

/// <summary>
/// DTO for creating or updating a market scoping parameter evaluation.
/// </summary>
public record MarketScopingParameterDto
{
    public Guid ParameterId { get; set; }
    public bool? IsConsidered { get; set; }
    public string? Remarks { get; set; }
    public List<MarketScopingParameterAttachmentDto> Attachments { get; set; } = [];
}
