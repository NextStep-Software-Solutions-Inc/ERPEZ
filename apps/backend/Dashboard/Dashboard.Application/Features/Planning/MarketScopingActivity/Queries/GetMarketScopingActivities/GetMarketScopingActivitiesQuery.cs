using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.MarketScopingActivity.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.MarketScopingActivity.Queries.GetMarketScopingActivities;

public record GetMarketScopingActivitiesQuery(Guid MarketScopingId) : PaginatedQuery<PaginatedApiResponse<MarketScopingActivityResponse>>;
