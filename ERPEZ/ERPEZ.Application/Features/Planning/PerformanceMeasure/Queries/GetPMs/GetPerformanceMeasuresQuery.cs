using ERPEZ.Application.Common.Queries;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.PerformanceMeasure.Queries.GetPMs;

public record GetPerformanceMeasuresQuery : PaginatedQuery<PaginatedApiResponse<Domain.Entities.Planning.PerformanceMeasure>>
{
}
