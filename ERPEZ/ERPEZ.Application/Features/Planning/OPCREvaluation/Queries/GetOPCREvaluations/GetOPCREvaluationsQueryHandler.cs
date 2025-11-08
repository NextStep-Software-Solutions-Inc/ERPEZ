using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCREvaluation.Queries.GetOPCREvaluations;

public class GetOPCREvaluationsQueryHandler(IUnitOfWork _unitOfWork) : IRequestHandler<GetOPCREvaluationsQuery, PaginatedApiResponse<Domain.Entities.Planning.OPCREvaluation>>
{
    public async Task<PaginatedApiResponse<Domain.Entities.Planning.OPCREvaluation>> Handle(GetOPCREvaluationsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        var (opcrEvaluations, totalCount) = await _unitOfWork.OPCREvaluationRepository.GetAllAsync(sieveModel, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<Domain.Entities.Planning.OPCREvaluation>(
            [.. opcrEvaluations],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
