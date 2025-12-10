using ERPEZ.Application.Common.Queries;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.WFPObjective.Queries.GetWFPObjectives;

public record GetWFPObjectivesQuery : PaginatedQuery<PaginatedApiResponse<Domain.Entities.Planning.WFPObjective>>
{
}
