using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.WFP.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.WFP.Queries.GetWFPs;

public record GetWFPsQuery : PaginatedQuery<PaginatedApiResponse<WFPsResponse>>
{
}
