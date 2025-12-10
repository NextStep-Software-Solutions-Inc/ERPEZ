using ERPEZ.Application.Common.Queries;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Queries.GetWFPObjectiveTargets;

public record GetWFPObjectiveTargetsQuery : PaginatedQuery<PaginatedApiResponse<Domain.Entities.Planning.WFPObjectiveTarget>>
{
}
