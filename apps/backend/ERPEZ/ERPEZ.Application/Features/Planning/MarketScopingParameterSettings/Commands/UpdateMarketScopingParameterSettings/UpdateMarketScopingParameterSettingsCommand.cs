using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MarketScopingParameterSettings.Commands.UpdateMarketScopingParameterSettings;

public record UpdateMarketScopingParameterSettingsRequest
{
    public required string Name { get; init; }
    public required string GuidedQuestion { get; init; }
    public string? Description { get; init; }
    public int SortOrder { get; init; }
    public bool IsActive { get; init; }
}

public record UpdateMarketScopingParameterSettingsCommand : IRequest<ApiResponse<Unit>>
{
    public required Guid Id { get; init; }
    public required UpdateMarketScopingParameterSettingsRequest UpdateData { get; init; }
}
