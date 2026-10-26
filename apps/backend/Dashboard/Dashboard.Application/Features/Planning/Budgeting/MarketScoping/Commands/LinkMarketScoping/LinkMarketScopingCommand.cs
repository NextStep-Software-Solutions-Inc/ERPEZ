using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.LinkMarketScoping;

public record LinkMarketScopingCommand(Guid MarketScopingId, LinkMarketScopingRequest Request)
    : IRequest<ApiResponse<Unit>>;
