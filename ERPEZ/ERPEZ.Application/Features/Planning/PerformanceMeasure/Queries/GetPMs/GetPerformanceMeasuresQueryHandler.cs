using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PerformanceMeasure.Queries.GetPMs;

public class GetPerformanceMeasuresQueryHandler(IUnitOfWork _unitOfWork) : IRequestHandler<GetPerformanceMeasuresQuery, PaginatedApiResponse<Domain.Entities.Planning.PerformanceMeasure>>
{
    public async Task<PaginatedApiResponse<Domain.Entities.Planning.PerformanceMeasure>> Handle(GetPerformanceMeasuresQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        var (pms, totalCount) = await _unitOfWork.PerformanceMeasureRepository.GetAllAsync(sieveModel, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<Domain.Entities.Planning.PerformanceMeasure>(
            [.. pms],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}