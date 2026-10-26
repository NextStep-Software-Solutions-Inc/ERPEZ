using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MarketScopingParameterSettings.Commands.CreateMarketScopingParameterSettings;

public record CreateMarketScopingParameterSettingsCommand : IRequest<ApiResponse<Guid>>
{
    public required string Name { get; init; }
    public required string GuidedQuestion { get; init; }
    public string? Description { get; init; }
    public int SortOrder { get; init; }
}
