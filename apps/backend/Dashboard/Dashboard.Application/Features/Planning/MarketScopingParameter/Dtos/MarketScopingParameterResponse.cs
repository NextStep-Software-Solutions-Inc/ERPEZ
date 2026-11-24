namespace ERPEZ.Application.Features.Planning.MarketScopingParameter.Dtos;

public record MarketScopingParameterResponse
{
    public required Guid Id { get; init; }
    public required Guid MarketScopingId { get; init; }
    public required Guid ParameterSettingsId { get; init; }
    public string? ParameterName { get; init; }
    public string? GuidedQuestion { get; init; }
    public bool? IsConsidered { get; init; }
    public string? Remarks { get; init; }
}
