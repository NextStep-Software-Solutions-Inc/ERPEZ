using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.UnlinkMarketScoping;

public record UnlinkMarketScopingCommand(Guid MarketScopingId) : IRequest<ApiResponse<Unit>>;
