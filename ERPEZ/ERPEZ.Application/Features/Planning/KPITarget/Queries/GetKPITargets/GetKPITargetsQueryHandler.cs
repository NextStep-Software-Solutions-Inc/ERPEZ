using ERPEZ.Application.Features.Planning.KPITarget.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.KPITarget.Queries.GetKPITargets;

public class GetKPITargetsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetKPITargetsQuery, PaginatedApiResponse<KPITargetResponse>>
{
    public async Task<PaginatedApiResponse<KPITargetResponse>> Handle(GetKPITargetsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.KPITarget, KPITargetResponse>> projection = kpiTarget => new KPITargetResponse
        {
            Id = kpiTarget.Id,
            KPIId = kpiTarget.KPIId,
            TargetValue = kpiTarget.KPI.IsPercentage
                ? kpiTarget.TargetValue * 100M
                : kpiTarget.TargetValue,
            Period = kpiTarget.Period,
            QuarterName = kpiTarget.QuarterName,
            CreatedAt = kpiTarget.CreatedAt,
            CreatedBy = kpiTarget.CreatedBy
        };

        var (kpiTargets, totalCount) = await unitOfWork.KPITargetRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<KPITargetResponse>(
            [.. kpiTargets],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
