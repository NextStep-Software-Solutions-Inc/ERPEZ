using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.SubmitMarketScoping;

public record SubmitMarketScopingCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
