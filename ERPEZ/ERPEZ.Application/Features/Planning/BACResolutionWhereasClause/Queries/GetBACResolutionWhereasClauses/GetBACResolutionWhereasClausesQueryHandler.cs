using ERPEZ.Application.Features.Planning.BACResolutionWhereasClause.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.BACResolutionWhereasClause.Queries.GetBACResolutionWhereasClauses;

public class GetBACResolutionWhereasClausesQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetBACResolutionWhereasClausesQuery, PaginatedApiResponse<BACResolutionWhereasClauseResponse>>
{
    public async Task<PaginatedApiResponse<BACResolutionWhereasClauseResponse>> Handle(GetBACResolutionWhereasClausesQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.BACResolutionWhereasClause, BACResolutionWhereasClauseResponse>> projection = c => new BACResolutionWhereasClauseResponse
        {
            Id = c.Id,
            Name = c.Name,
            Body = c.Body
        };

        var (entities, totalCount) = await unitOfWork.BACResolutionWhereasClauseRepository.GetAllAsync(
            sieveModel,
            projection,
            cancellationToken: cancellationToken);

        return new PaginatedApiResponse<BACResolutionWhereasClauseResponse>(
            [.. entities],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
