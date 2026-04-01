using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.WFPObjectiveActivity.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveActivity.Queries.GetWFPObjectiveActivities;

public record GetWFPObjectiveActivitiesQuery : PaginatedQuery<PaginatedApiResponse<WFPObjectiveActivityResponse>>
{
}
