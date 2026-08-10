using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.OPCRConsolidation.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.OPCRConsolidation.Queries;

public record GetOPCRConsolidationsQuery : PaginatedQuery<PaginatedApiResponse<OPCRConsolidationsResponse>>
{
}