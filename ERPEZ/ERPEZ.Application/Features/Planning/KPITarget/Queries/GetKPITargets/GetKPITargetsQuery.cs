using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.KPITarget.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.KPITarget.Queries.GetKPITargets;

public record GetKPITargetsQuery : PaginatedQuery<PaginatedApiResponse<KPITargetResponse>>
{
}
