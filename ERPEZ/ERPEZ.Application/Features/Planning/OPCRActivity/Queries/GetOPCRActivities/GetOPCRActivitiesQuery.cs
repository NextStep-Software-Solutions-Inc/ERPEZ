using ERPEZ.Application.Common.Queries;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.OPCRActivity.Queries.GetOPCRActivities;

public record GetOPCRActivitiesQuery : PaginatedQuery<PaginatedApiResponse<Domain.Entities.Planning.OPCRActivity>>
{
}
