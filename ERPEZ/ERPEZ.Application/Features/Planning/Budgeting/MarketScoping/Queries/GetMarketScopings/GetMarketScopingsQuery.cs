using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Queries.GetMarketScopings;

public record GetMarketScopingsQuery(
    int PageNumber = 1,
    int PageSize = 10,
    string? Filters = null,
    string? Sorts = null
) : IRequest<PaginatedApiResponse<MarketScopingResponse>>;
