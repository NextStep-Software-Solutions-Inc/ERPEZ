using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DeliveryUnit.Queries.GetDUsQuery;

public class GetDeliveryUnitsQuery : IRequest<PaginatedApiResponse<Domain.Entities.Planning.DeliveryUnit>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Filters { get; set; }
    public string? Sorts { get; set; }
}
