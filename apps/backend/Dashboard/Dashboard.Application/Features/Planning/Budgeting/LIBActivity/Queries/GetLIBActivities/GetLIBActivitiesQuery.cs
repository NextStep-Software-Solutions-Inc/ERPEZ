using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.Budgeting.LIBActivity.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIBActivity.Queries.GetLIBActivities;

public record GetLIBActivitiesQuery : PaginatedQuery<PaginatedApiResponse<LIBActivityResponse>>;

