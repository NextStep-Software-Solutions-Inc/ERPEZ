using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.OPCRActivity.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.OPCRActivity.Queries.GetOPCRActivities;

public record GetOPCRActivitiesQuery : PaginatedQuery<PaginatedApiResponse<OPCRActivityResponse>>
{
}
