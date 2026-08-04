using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.ReturnMarketScoping;

public record ReturnMarketScopingCommand(Guid Id, string? Remarks) : IRequest<ApiResponse<Unit>>;
