using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.MarketScopingParameter.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.MarketScopingParameter.Queries.GetMarketScopingParameters;

public record GetMarketScopingParametersQuery(Guid MarketScopingId) : PaginatedQuery<PaginatedApiResponse<MarketScopingParameterResponse>>;
