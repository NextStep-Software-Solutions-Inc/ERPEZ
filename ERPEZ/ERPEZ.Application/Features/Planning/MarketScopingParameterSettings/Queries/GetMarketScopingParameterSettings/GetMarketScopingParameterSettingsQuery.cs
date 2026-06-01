using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.MarketScopingParameterSettings.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.MarketScopingParameterSettings.Queries.GetMarketScopingParameterSettings;

public record GetMarketScopingParameterSettingsQuery : PaginatedQuery<PaginatedApiResponse<MarketScopingParameterSettingsResponse>>;
