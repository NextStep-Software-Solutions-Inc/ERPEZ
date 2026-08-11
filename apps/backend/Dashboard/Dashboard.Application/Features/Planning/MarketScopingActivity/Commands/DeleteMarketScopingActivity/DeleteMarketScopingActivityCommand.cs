using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MarketScopingActivity.Commands.DeleteMarketScopingActivity;

public record DeleteMarketScopingActivityCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
