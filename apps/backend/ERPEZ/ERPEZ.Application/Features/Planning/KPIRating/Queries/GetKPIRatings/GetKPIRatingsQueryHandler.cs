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

        Expression<Func<Domain.Entities.Planning.Rating, KPIRatingResponse>> projection = r => new KPIRatingResponse
        {
            Id = r.Id,
            KPIId = r.KPIPerformanceMeasure!.KPIId,
            NumericalRating = r.NumericalRating,
            PerformanceMeasureId = r.KPIPerformanceMeasure!.PerformanceMeasureId,
            Remarks = r.Remarks,
            CreatedAt = r.CreatedAt,
            CreatedBy = r.CreatedBy
        };
        var (kpiRatings, totalCount) = await unitOfWork.RatingRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<KPIRatingResponse>(
            [.. kpiRatings],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
