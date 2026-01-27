using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Queries.GetWFPObjectiveTimelines;

public record GetWFPObjectiveTimelinesQuery : PaginatedQuery<PaginatedApiResponse<WFPObjectiveTimelineResponse>>
{
}
