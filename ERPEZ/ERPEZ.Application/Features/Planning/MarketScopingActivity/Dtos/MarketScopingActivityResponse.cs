namespace ERPEZ.Application.Features.Planning.MarketScopingActivity.Dtos;

public record MarketScopingActivityResponse
{
    public required Guid Id { get; init; }
    public required Guid MarketScopingId { get; init; }
    public required Guid ActivitySettingsId { get; init; }
    public string? ActivityType { get; init; }
    public string? ActivityLabel { get; init; }
    public string? ActivityDescription { get; init; }
}
