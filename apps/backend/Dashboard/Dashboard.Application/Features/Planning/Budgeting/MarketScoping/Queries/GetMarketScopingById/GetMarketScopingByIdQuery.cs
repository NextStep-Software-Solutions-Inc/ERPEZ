using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Queries.GetMarketScopingById;

public record GetMarketScopingByIdQuery(Guid Id) : IRequest<ApiResponse<MarketScopingResponse>>;
