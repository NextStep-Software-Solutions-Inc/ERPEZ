using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.OPCRItem.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.OPCRItem.Queries.GetOPCRItems;

public record GetOPCRItemsQuery : PaginatedQuery<PaginatedApiResponse<OPCRItemResponse>>
{
}
