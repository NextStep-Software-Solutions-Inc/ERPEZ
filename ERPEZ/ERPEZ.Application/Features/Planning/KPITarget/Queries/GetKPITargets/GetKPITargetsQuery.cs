using ERPEZ.Application.Features.Planning.KPITarget.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPITarget.Queries.GetKPITargets;

public class GetKPITargetsQuery : IRequest<PaginatedApiResponse<KPITargetResponse>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Filters { get; set; }
    public string? Sorts { get; set; }
}
