namespace ERPEZ.Application.Features.Planning.MarketScopingParameterSettings.Dtos;

public record MarketScopingParameterSettingsResponse
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required string GuidedQuestion { get; init; }
    public string? Description { get; init; }
    public required int SortOrder { get; init; }
    public required bool IsActive { get; init; }
}
