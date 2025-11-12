using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPITarget.Queries.GetKPITargets;

public class GetKPITargetsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetKPITargetsQuery, PaginatedApiResponse<Domain.Entities.Planning.KPITarget>>
{
    public async Task<PaginatedApiResponse<Domain.Entities.Planning.KPITarget>> Handle(GetKPITargetsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        var (kpiTargets, totalCount) = await unitOfWork.KPITargetRepository.GetAllAsync(sieveModel, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<Domain.Entities.Planning.KPITarget>(
            [.. kpiTargets],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
