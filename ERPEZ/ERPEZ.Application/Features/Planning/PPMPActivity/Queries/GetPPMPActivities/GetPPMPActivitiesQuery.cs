using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.PPMPActivity.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.PPMPActivity.Queries.GetPPMPActivities;

public record GetPPMPActivitiesQuery : PaginatedQuery<PaginatedApiResponse<PPMPActivityResponse>>;
