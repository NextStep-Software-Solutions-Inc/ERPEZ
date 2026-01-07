using System.Linq.Expressions;
using ERPEZ.Application.Features.Planning.DeliveryUnit.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DeliveryUnit.Queries.GetDUsQuery;

public class GetDeliveryUnitsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetDeliveryUnitsQuery, PaginatedApiResponse<DeliveryUnitsResponse>>
{
    public async Task<PaginatedApiResponse<DeliveryUnitsResponse>> Handle(GetDeliveryUnitsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.DeliveryUnit, DeliveryUnitsResponse>> projection = du => new DeliveryUnitsResponse
        {
            Id = du.Id,
            OfficeName = du.Office.Name,
            ClusterName = du.Office.Cluster != null ? du.Office.Cluster.Name : null,
            KpiCount = du.KPITargetAssignments.DistinctBy(ka => ka.KPIId).Count(ka => ka.KPI.ParentKPIId == null),
            KPITargetCount = du.KPITargetAssignments.Count,
            SubKpiCount = du.KPITargetAssignments.DistinctBy(ka => ka.KPIId).Count(ka => ka.KPI.ParentKPIId != null),
            SubDUCount = du.SubDeliveryUnits.Count,
            ParentId = du.ParentId,
            CreatedAt = du.CreatedAt,
            TotalAmountAllocated = du.DUAllocations.Sum(da => da.Amount),
            TotalAmountUtilized = 0,
            FundSourceCount = du.DUAllocations
                .SelectMany(da => da.DUFundAllocations)
                .Select(fa => fa.ReceivedFundId)
                .Distinct()
                .Count(),
        };

        var (dus, totalCount) = await unitOfWork.DeliveryUnitRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);
        
        return new PaginatedApiResponse<DeliveryUnitsResponse>(
            [.. dus],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
