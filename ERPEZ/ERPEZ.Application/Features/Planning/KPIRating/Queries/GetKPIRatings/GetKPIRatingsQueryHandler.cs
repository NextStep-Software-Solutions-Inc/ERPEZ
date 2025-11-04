using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIRating.Queries.GetKPIRatings;

public class GetKPIRatingsQueryHandler(IUnitOfWork _unitOfWork) : IRequestHandler<GetKPIRatingsQuery, PaginatedApiResponse<Domain.Entities.Planning.KPIRating>>
{
    public async Task<PaginatedApiResponse<Domain.Entities.Planning.KPIRating>> Handle(GetKPIRatingsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        var (kpiRatings, totalCount) = await _unitOfWork.KPIRatingRepository.GetAllAsync(sieveModel, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<Domain.Entities.Planning.KPIRating>(
            [.. kpiRatings],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}