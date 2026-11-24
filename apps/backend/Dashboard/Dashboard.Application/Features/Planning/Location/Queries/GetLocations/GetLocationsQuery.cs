using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.Location.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.Location.Queries.GetLocations;

public record GetLocationsQuery : PaginatedQuery<PaginatedApiResponse<LocationResponse>>
{
    public Guid? FiscalYearId { get; init; }
}
