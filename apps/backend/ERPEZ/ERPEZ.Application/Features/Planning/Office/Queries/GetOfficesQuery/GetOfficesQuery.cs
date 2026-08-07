using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.Office.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.Office.Queries.GetOfficesQuery;

public record GetOfficesQuery : PaginatedQuery<PaginatedApiResponse<OfficeResponse>>
{
}
