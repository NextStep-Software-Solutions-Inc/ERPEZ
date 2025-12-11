using ERPEZ.Application.Common.Queries;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.Location.Queries.GetLocations;

public record GetLocationsQuery : PaginatedQuery<PaginatedApiResponse<Domain.Entities.Planning.Location>>
{
}
