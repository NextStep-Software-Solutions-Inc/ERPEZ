using ERPEZ.Application.Features.Planning.OPCRActivityRating.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.OPCRActivityRating.Queries.GetOPCRActivityRatings;

public class GetOPCRActivityRatingsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetOPCRActivityRatingsQuery, PaginatedApiResponse<OPCRActivityRatingResponse>>
{
    public async Task<PaginatedApiResponse<OPCRActivityRatingResponse>> Handle(
        GetOPCRActivityRatingsQuery query,
        CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.OPCRActivityRating, OPCRActivityRatingResponse>> projection = r => new OPCRActivityRatingResponse
        {
            Id = r.Id,
            OPCRActivityId = r.OPCRActivityId,
            PerformanceMeasureId = r.PerformanceMeasureId,
            ActualAccomplishedValue = r.ActualAccomplishedValue,
            Score = r.Score,
            Remarks = r.Remarks,
            Status = r.Status,
            SubmittedDate = r.SubmittedDate,
            CreatedAt = r.CreatedAt,
            CreatedBy = r.CreatedBy
        };

        var (ratings, totalCount) = await unitOfWork.OPCRActivityRatingRepository.GetAllAsync(
            sieveModel,
            projection,
            cancellationToken: cancellationToken);

        return new PaginatedApiResponse<OPCRActivityRatingResponse>(
            [.. ratings],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
