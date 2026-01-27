using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Queries.GetWFPObjectiveTargets;

public record GetWFPObjectiveTargetsQuery : PaginatedQuery<PaginatedApiResponse<WFPObjectiveTargetResponse>>
{
}
