using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MarketScopingParameter.Commands.CreateMarketScopingParameter;

public record CreateMarketScopingParameterCommand : IRequest<ApiResponse<Guid>>
{
    public required Guid MarketScopingId { get; init; }
    public required Guid ParameterSettingsId { get; init; }
    public required Guid ParameterId { get; init; }
    public bool? IsConsidered { get; init; }
    public string? Remarks { get; init; }
}
