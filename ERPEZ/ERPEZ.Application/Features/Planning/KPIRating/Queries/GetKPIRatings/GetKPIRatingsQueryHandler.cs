using ERPEZ.Application.Features.Planning.KPIRating.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.KPIRating.Queries.GetKPIRatings;

public class GetKPIRatingsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetKPIRatingsQuery, PaginatedApiResponse<KPIRatingResponse>>
{
    public async Task<PaginatedApiResponse<KPIRatingResponse>> Handle(GetKPIRatingsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.KPIRating, KPIRatingResponse>> projection = kPIRating => new KPIRatingResponse
        {
            Id = kPIRating.KPIId,
            KPIId = kPIRating.KPIId,
            NumericalRating = kPIRating.NumericalRating,
            PerformanceMeasureId = kPIRating.PerformanceMeasureId,
            Remarks = kPIRating.Remarks,
            CreatedAt = kPIRating.CreatedAt,
            CreatedBy = kPIRating.CreatedBy
        };
        var (kpiRatings, totalCount) = await unitOfWork.KPIRatingRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<KPIRatingResponse>(
            [.. kpiRatings],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
