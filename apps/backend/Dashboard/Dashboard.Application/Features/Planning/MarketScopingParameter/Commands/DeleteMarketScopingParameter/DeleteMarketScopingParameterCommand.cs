using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MarketScopingParameter.Commands.DeleteMarketScopingParameter;

public record DeleteMarketScopingParameterCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
