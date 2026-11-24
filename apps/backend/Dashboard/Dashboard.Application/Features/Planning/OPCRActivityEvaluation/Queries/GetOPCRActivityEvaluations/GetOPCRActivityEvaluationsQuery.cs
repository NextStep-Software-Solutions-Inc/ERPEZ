using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.OPCRActivityEvaluation.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.OPCRActivityEvaluation.Queries.GetOPCRActivityEvaluations;

public record GetOPCRActivityEvaluationsQuery : PaginatedQuery<PaginatedApiResponse<OPCRActivityEvaluationResponse>>
{
}
