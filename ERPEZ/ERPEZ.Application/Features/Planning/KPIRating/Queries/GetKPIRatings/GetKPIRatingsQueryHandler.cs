using ERPEZ.Application.Features.Planning.Rating.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.Rating.Queries.GetRatings;

public class GetRatingsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetRatingsQuery, PaginatedApiResponse<RatingResponse>>
{
    public async Task<PaginatedApiResponse<RatingResponse>> Handle(GetRatingsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.Rating, RatingResponse>> projection = r => new RatingResponse
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
        return new PaginatedApiResponse<RatingResponse>(
            [.. kpiRatings],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
