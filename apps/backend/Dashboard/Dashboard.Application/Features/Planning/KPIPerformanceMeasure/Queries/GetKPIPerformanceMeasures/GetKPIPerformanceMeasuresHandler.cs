using ERPEZ.Application.Features.Planning.KPIPerformanceMeasure.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.KPIPerformanceMeasure.Queries.GetKPIPerformanceMeasures;

public class GetKPIPerformanceMeasuresHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetKPIPerformanceMeasuresQuery, PaginatedApiResponse<KPIPerformanceMeasureResponse>>
{
    public async Task<PaginatedApiResponse<KPIPerformanceMeasureResponse>> Handle(GetKPIPerformanceMeasuresQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.KPIPerformanceMeasure, KPIPerformanceMeasureResponse>> projection =
            x => new KPIPerformanceMeasureResponse
            {
                Id = x.Id,
                KPIId = x.KPIId,
                PerformanceMeasureId = x.PerformanceMeasureId,
                CreatedAt = x.CreatedAt
            };

        var (entities, totalCount) = await unitOfWork.KPIPerformanceMeasureRepository.GetAllAsync(
            sieveModel,
            projection,
            cancellationToken);

        return new PaginatedApiResponse<KPIPerformanceMeasureResponse>(
            entities.ToList(),
            sieveModel.Page ?? 1,
            sieveModel.PageSize ?? 10,
            totalCount);
    }
}
