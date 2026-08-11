namespace ERPEZ.Application.Features.Planning.MarketScopingActivitySettings.Dtos;

public record MarketScopingActivitySettingsResponse
{
    public required Guid Id { get; init; }
    public required string ActivityType { get; init; }
    public required string Label { get; init; }
    public string? Description { get; init; }
    public required int SortOrder { get; init; }
    public required bool IsActive { get; init; }
}
