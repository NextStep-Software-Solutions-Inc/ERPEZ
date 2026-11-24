using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.CreateMarketScopingActivity;

public record CreateMarketScopingActivityCommand(CreateMarketScopingActivityRequest Request) : IRequest<ApiResponse<Guid>>;
