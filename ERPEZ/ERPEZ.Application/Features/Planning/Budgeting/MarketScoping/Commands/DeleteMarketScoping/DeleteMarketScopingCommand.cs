using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.DeleteMarketScoping;

public record DeleteMarketScopingCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
