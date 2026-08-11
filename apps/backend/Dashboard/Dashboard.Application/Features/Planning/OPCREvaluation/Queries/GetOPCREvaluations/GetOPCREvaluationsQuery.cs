using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.OPCREvaluation.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.OPCREvaluation.Queries.GetOPCREvaluations;

public record GetOPCREvaluationsQuery : PaginatedQuery<PaginatedApiResponse<OPCREvaluationResponse>>
{
}
