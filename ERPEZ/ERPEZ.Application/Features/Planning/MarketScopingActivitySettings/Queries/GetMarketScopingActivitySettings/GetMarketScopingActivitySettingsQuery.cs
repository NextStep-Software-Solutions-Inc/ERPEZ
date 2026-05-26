using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.MarketScopingActivitySettings.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.MarketScopingActivitySettings.Queries.GetMarketScopingActivitySettings;

public record GetMarketScopingActivitySettingsQuery : PaginatedQuery<PaginatedApiResponse<MarketScopingActivitySettingsResponse>>;
