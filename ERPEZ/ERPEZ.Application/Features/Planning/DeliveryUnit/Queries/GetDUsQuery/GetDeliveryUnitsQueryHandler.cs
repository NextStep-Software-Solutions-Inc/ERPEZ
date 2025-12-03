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
            KpiCount = du.KPIAssignments.Count(ka => ka.KPI.ParentKPIId == null),
            SubKpiCount = du.KPIAssignments.Count(ka => ka.KPI.ParentKPIId != null),
            SubDUCount = du.SubDeliveryUnits.Count,
            ParentDUId = du.ParentDUId,
            CreatedAt = du.CreatedAt,
        };

        var (dus, totalCount) = await unitOfWork.DeliveryUnitRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);
        
        return new PaginatedApiResponse<DeliveryUnitsResponse>(
            [.. dus],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
