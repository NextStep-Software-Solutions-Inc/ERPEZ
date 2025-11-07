using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjective.Queries.GetWFPObjectives;

public class GetWFPObjectivesQueryHandler(IUnitOfWork _unitOfWork) : IRequestHandler<GetWFPObjectivesQuery, PaginatedApiResponse<Domain.Entities.Planning.WFPObjective>>
{
    public async Task<PaginatedApiResponse<Domain.Entities.Planning.WFPObjective>> Handle(GetWFPObjectivesQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        var (wfpObjectives, totalCount) = await _unitOfWork.WFPObjectiveRepository.GetAllAsync(sieveModel, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<Domain.Entities.Planning.WFPObjective>(
            [.. wfpObjectives],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
