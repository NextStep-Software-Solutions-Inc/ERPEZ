using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.WFPObjective.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.WFPObjective.Queries.GetWFPObjectives;

public record GetWFPObjectivesQuery : PaginatedQuery<PaginatedApiResponse<WFPObjectiveResponse>>
{
}
