using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MarketScopingParameter.Commands.UpdateMarketScopingParameter;

public record UpdateMarketScopingParameterRequest
{
    public bool? IsConsidered { get; init; }
    public string? Remarks { get; init; }
}

public record UpdateMarketScopingParameterCommand : IRequest<ApiResponse<Unit>>
{
    public required Guid Id { get; init; }
    public required UpdateMarketScopingParameterRequest UpdateData { get; init; }
}
