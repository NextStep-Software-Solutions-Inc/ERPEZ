using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.PerformanceMeasure.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.PerformanceMeasure.Queries.GetPMs;

public record GetPerformanceMeasuresQuery : PaginatedQuery<PaginatedApiResponse<PerformanceMeasureResponse>>
{
}
