using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MarketScopingActivity.Commands.CreateMarketScopingActivity;

public record CreateMarketScopingActivityCommand : IRequest<ApiResponse<Guid>>
{
    public required Guid MarketScopingId { get; init; }
    public required Guid ActivitySettingsId { get; init; }
    public required Guid ActivityId { get; init; }
}
