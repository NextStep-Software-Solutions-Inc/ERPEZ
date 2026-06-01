using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MarketScopingActivitySettings.Commands.CreateMarketScopingActivitySettings;

public record CreateMarketScopingActivitySettingsCommand : IRequest<ApiResponse<Guid>>
{
    public required string ActivityType { get; init; }
    public required string Label { get; init; }
    public string? Description { get; init; }
    public int SortOrder { get; init; }
}
