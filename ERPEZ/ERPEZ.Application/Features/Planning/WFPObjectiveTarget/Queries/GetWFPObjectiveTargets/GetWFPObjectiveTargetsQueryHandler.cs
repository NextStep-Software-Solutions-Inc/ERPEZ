using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Queries.GetWFPObjectiveTargets;

public class GetWFPObjectiveTargetsQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetWFPObjectiveTargetsQuery, PaginatedApiResponse<Domain.Entities.Planning.WFPObjectiveTarget>>
{
    public async Task<PaginatedApiResponse<Domain.Entities.Planning.WFPObjectiveTarget>> Handle(
        GetWFPObjectiveTargetsQuery query, 
        CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        var (targets, totalCount) = await unitOfWork.WFPObjectiveTargetRepository.GetAllAsync(sieveModel, cancellationToken);
        
        return new PaginatedApiResponse<Domain.Entities.Planning.WFPObjectiveTarget>(
            [.. targets],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
