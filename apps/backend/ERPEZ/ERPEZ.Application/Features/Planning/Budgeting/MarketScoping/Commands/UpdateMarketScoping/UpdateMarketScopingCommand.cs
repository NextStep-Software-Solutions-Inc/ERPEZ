using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.UpdateMarketScoping;

public record UpdateMarketScopingCommand(UpdateMarketScopingRequest Request) : IRequest<ApiResponse<Unit>>;
