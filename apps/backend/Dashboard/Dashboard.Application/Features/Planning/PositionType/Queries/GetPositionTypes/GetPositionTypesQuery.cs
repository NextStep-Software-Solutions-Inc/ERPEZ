using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.PositionType.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.PositionType.Queries.GetPositionTypes;

public record GetPositionTypesQuery : PaginatedQuery<PaginatedApiResponse<PositionTypeResponse>>;
