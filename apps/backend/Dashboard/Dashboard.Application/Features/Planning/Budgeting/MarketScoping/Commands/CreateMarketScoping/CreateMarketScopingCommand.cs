using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.CreateMarketScoping;

public record CreateMarketScopingCommand(CreateMarketScopingRequest Request) : IRequest<ApiResponse<Guid>>;
