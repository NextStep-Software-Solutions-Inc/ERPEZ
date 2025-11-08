using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRRating.Queries.GetOPCRRatings;

public class GetOPCRRatingsQueryHandler(IUnitOfWork _unitOfWork) : IRequestHandler<GetOPCRRatingsQuery, PaginatedApiResponse<Domain.Entities.Planning.OPCRRating>>
{
    public async Task<PaginatedApiResponse<Domain.Entities.Planning.OPCRRating>> Handle(GetOPCRRatingsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        var (opcrRatings, totalCount) = await _unitOfWork.OPCRRatingRepository.GetAllAsync(sieveModel, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<Domain.Entities.Planning.OPCRRating>(
            [.. opcrRatings],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}