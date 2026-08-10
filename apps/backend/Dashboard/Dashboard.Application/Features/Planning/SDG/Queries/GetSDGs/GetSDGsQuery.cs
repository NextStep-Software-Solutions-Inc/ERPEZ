using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.SDG.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.SDG.Queries.GetSDGs;

public record GetSDGsQuery : PaginatedQuery<PaginatedApiResponse<SDGResponse>>
{
}
