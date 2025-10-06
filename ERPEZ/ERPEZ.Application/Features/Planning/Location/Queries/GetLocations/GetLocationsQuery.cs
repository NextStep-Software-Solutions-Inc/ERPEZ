using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Location.Queries.GetLocations;

public class GetLocationsQuery : IRequest<PaginatedApiResponse<Domain.Entities.Planning.Location>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Filters { get; set; }
    public string? Sorts { get; set; }
}
