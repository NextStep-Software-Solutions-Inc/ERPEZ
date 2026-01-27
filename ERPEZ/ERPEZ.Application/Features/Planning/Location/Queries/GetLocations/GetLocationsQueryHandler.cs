using ERPEZ.Application.Features.Planning.Location.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.Location.Queries.GetLocations;

public class GetLocationsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetLocationsQuery, PaginatedApiResponse<LocationResponse>>
{
    public async Task<PaginatedApiResponse<LocationResponse>> Handle(GetLocationsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.Location, LocationResponse>> projection = location => new LocationResponse
        {
            ParentId = location.ParentId,
            Name = location.Name,
            Code = location.Code,
            Type = location.Type,
            IsActive = location.IsActive
        };

        var (locations, totalCount) = await unitOfWork.LocationRepository.GetAllAsync(sieveModel, projection, cancellationToken);

        return new PaginatedApiResponse<LocationResponse>(
            [.. locations],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
