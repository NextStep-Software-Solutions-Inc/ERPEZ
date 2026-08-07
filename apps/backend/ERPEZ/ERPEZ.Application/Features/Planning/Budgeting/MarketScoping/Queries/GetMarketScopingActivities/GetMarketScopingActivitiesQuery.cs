using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Queries.GetMarketScopingActivities;

public record GetMarketScopingActivitiesQuery(
    Guid MarketScopingId,
    int PageNumber = 1,
    int PageSize = 10,
    string? Filters = null,
    string? Sorts = null
) : IRequest<PaginatedApiResponse<MarketScopingActivityResponse>>;
