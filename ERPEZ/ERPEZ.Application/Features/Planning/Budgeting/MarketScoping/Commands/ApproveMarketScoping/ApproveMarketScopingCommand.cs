using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.ApproveMarketScoping;

public record ApproveMarketScopingCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
