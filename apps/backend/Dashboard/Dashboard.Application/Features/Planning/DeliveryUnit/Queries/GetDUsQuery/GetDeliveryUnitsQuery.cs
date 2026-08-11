using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.DeliveryUnit.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.DeliveryUnit.Queries.GetDUsQuery;

public record GetDeliveryUnitsQuery : PaginatedQuery<PaginatedApiResponse<DeliveryUnitsResponse>>
{
}
