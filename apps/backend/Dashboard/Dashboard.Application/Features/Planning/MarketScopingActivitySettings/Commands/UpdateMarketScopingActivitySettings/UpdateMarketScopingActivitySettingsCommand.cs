using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MarketScopingActivitySettings.Commands.UpdateMarketScopingActivitySettings;

public record UpdateMarketScopingActivitySettingsRequest
{
    public required string ActivityType { get; init; }
    public required string Label { get; init; }
    public string? Description { get; init; }
    public int SortOrder { get; init; }
    public bool IsActive { get; init; }
}

public record UpdateMarketScopingActivitySettingsCommand : IRequest<ApiResponse<Unit>>
{
    public required Guid Id { get; init; }
    public required UpdateMarketScopingActivitySettingsRequest UpdateData { get; init; }
}
