using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.PPMP.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.PPMP.Queries.GetPPMPs;

public record GetPPMPsQuery : PaginatedQuery<PaginatedApiResponse<PPMPDetailedResponse>>
{
    public string? Search { get; init; }
}
