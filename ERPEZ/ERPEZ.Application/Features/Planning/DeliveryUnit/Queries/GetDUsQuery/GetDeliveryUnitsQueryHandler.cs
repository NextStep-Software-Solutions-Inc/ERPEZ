using System.Linq.Expressions;
using ERPEZ.Application.Features.Planning.DeliveryUnit.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DeliveryUnit.Queries.GetDUsQuery;

public class GetDeliveryUnitsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetDeliveryUnitsQuery, PaginatedApiResponse<DeliveryUnitsResponse>>
{
    public async Task<PaginatedApiResponse<DeliveryUnitsResponse>> Handle(GetDeliveryUnitsQuery query, CancellationToken cancellationToken)
    {
        var accountsQuery = unitOfWork.AccountRepository.Query();
        var transactionsQuery = unitOfWork.AccountTransactionRepository.Query(t => t.Status == StatusEnum.Completed);

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
            KpiCount = du.KPITargetAssignments
                .Where(ka => ka.KPI.ParentKPIId == null)
                .Select(ka => ka.KPIId)
                .Distinct()
                .Count(),
            KPITargetCount = du.KPITargetAssignments.Count,
            SubKpiCount = du.KPITargetAssignments
                .Where(ka => ka.KPI.ParentKPIId != null)
                .Select(ka => ka.KPIId)
                .Distinct()
                .Count(),
            SubDUCount = du.SubDeliveryUnits.Count,
            ParentId = du.ParentId,
            CreatedAt = du.CreatedAt,
            TotalAmountAllocated = accountsQuery
                .Where(a => a.OfficeId == du.OfficeId)
                .Select(a => a.Balance)
                .DefaultIfEmpty(0m)
                .Sum(),
            TotalAmountUtilized = transactionsQuery
                .Where(t => t.FromAccount.OfficeId == du.OfficeId)
                .Select(t => t.AmountTransfer)
                .DefaultIfEmpty(0m)
                .Sum(),
            FundSourceCount = accountsQuery
                .Where(a => a.OfficeId == du.OfficeId && a.FundSourceId.HasValue)
                .Select(a => a.FundSourceId)
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
