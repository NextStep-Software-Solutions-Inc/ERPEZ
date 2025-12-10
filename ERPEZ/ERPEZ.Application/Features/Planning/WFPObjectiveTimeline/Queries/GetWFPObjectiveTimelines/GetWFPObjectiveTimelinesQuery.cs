using ERPEZ.Application.Common.Queries;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Queries.GetWFPObjectiveTimelines;

public record GetWFPObjectiveTimelinesQuery : PaginatedQuery<PaginatedApiResponse<Domain.Entities.Planning.WFPObjectiveTimeline>>
{
}
