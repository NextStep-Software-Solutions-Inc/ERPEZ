using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.KPIPerformanceMeasure.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.KPIPerformanceMeasure.Queries.GetKPIPerformanceMeasures;

public record GetKPIPerformanceMeasuresQuery : PaginatedQuery<PaginatedApiResponse<KPIPerformanceMeasureResponse>>
{
}
