using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.BACResolutionWhereasClause.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.BACResolutionWhereasClause.Queries.GetBACResolutionWhereasClauses;

public record GetBACResolutionWhereasClausesQuery : PaginatedQuery<PaginatedApiResponse<BACResolutionWhereasClauseResponse>>;
