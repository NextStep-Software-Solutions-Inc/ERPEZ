using ERPEZ.Application.Features.Planning.OPCREvaluation.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.OPCREvaluation.Queries.GetOPCREvaluations;

public class GetOPCREvaluationsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetOPCREvaluationsQuery, PaginatedApiResponse<OPCREvaluationResponse>>
{
    public async Task<PaginatedApiResponse<OPCREvaluationResponse>> Handle(GetOPCREvaluationsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.OPCREvaluation, OPCREvaluationResponse>> projection = opcrEvaluation => new OPCREvaluationResponse
        {
            Id = opcrEvaluation.Id,
            OPCRId = opcrEvaluation.OPCRId,
            EvaluatorId = opcrEvaluation.EvaluatorId,
            EvaluationDate = opcrEvaluation.EvaluationDate,
            Comments = opcrEvaluation.Comments,
            Status = opcrEvaluation.Status,
            CreatedAt = opcrEvaluation.CreatedAt,
            CreatedBy = opcrEvaluation.CreatedBy
        };
        var (opcrEvaluations, totalCount) = await unitOfWork.OPCREvaluationRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<OPCREvaluationResponse>(
            [.. opcrEvaluations],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
