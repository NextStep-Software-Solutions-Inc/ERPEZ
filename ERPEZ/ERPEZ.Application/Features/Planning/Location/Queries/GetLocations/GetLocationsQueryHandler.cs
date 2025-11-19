using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Planning.Location.Queries.GetLocations;

public class GetLocationsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetLocationsQuery, PaginatedApiResponse<Domain.Entities.Planning.Location>>
{
    public async Task<PaginatedApiResponse<Domain.Entities.Planning.Location>> Handle(GetLocationsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        var (locations, totalCount) = await unitOfWork.LocationRepository.GetAllAsync(sieveModel, cancellationToken: cancellationToken);

        return new PaginatedApiResponse<Domain.Entities.Planning.Location>(
            [.. locations],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
