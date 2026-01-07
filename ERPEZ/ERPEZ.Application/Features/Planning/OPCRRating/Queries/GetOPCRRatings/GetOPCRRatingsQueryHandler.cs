using ERPEZ.Application.Features.Planning.OPCRRating.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.OPCRRating.Queries.GetOPCRRatings;

public class GetOPCRRatingsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetOPCRRatingsQuery, PaginatedApiResponse<OPCRRatingResponse>>
{
    public async Task<PaginatedApiResponse<OPCRRatingResponse>> Handle(GetOPCRRatingsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        Expression<Func<Domain.Entities.Planning.OPCRRating, OPCRRatingResponse>> projection = or => new OPCRRatingResponse
        {
            Id = or.Id,
            OPCREvaluationId = or.OPCREvaluationId,
            PerformanceMeasureId = or.PerformanceMeasureId,
            OPCRId = or.OPCRId,
            DUKPITargetAssignmentId = or.DUKPITargetAssignmentId,
            NumericalRating = or.NumericalRating,
            Remarks = or.Remarks,
            CreatedBy = or.CreatedBy,
            CreatedAt = or.CreatedAt
        };
        var (opcrRatings, totalCount) = await unitOfWork.OPCRRatingRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<OPCRRatingResponse>(
            [.. opcrRatings],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
