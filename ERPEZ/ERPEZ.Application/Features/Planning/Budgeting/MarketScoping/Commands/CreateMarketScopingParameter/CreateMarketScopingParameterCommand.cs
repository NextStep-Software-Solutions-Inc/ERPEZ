using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.CreateMarketScopingParameter;

public record CreateMarketScopingParameterCommand(CreateMarketScopingParameterRequest Request) : IRequest<ApiResponse<Guid>>;
