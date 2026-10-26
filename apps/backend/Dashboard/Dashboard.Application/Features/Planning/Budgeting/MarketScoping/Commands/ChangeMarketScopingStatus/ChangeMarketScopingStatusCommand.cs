using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.ChangeMarketScopingStatus;

public record ChangeMarketScopingStatusCommand(ChangeMarketScopingStatusRequest Request) : IRequest<ApiResponse<Unit>>;
