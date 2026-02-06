using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.Position.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.Position.Queries.GetPositions;

public record GetPositionsQuery : PaginatedQuery<PaginatedApiResponse<PositionResponse>>;
