using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.ResolutionClause.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.ResolutionClause.Queries.GetResolutionClauses;

public record GetResolutionClausesQuery : PaginatedQuery<PaginatedApiResponse<ResolutionClauseResponse>>
{
    public string? ClauseType { get; init; }
}
