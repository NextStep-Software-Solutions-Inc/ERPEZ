using ERPEZ.Application.Features.Planning.OPCRActivityEvaluation.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.OPCRActivityEvaluation.Queries.GetOPCRActivityEvaluations;

public class GetOPCRActivityEvaluationsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetOPCRActivityEvaluationsQuery, PaginatedApiResponse<OPCRActivityEvaluationResponse>>
{
    public async Task<PaginatedApiResponse<OPCRActivityEvaluationResponse>> Handle(
        GetOPCRActivityEvaluationsQuery query,
        CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.OPCRActivityEvaluation, OPCRActivityEvaluationResponse>> projection = e => new OPCRActivityEvaluationResponse
        {
            Id = e.Id,
            OPCRActivityRatingId = e.OPCRActivityRatingId,
            EvaluatorScore = e.EvaluatorScore,
            Remarks = e.Remarks,
            EvaluatedDate = e.EvaluatedDate,
            Status = e.Status,
            CreatedAt = e.CreatedAt,
            CreatedBy = e.CreatedBy
        };

        var (evaluations, totalCount) = await unitOfWork.OPCRActivityEvaluationRepository.GetAllAsync(
            sieveModel,
            projection,
            cancellationToken: cancellationToken);

        return new PaginatedApiResponse<OPCRActivityEvaluationResponse>(
            [.. evaluations],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
