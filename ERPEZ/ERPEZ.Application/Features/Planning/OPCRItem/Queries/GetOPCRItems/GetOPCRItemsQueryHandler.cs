using System.Linq.Expressions;
using ERPEZ.Application.Features.Planning.OPCRItem.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRItem.Queries.GetOPCRItems;

public class GetOPCRItemsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetOPCRItemsQuery, PaginatedApiResponse<OPCRItemResponse>>
{
    public async Task<PaginatedApiResponse<OPCRItemResponse>> Handle(GetOPCRItemsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.OPCRItem, OPCRItemResponse>> projection = item => new OPCRItemResponse
        {
            Id = item.Id,
            OPCRId = item.OPCRId,
            KPIAssignmentId = item.KPIAssignmentId,
            OfficeId = item.OPCR.OfficeId,
            OfficeName = item.OPCR.Office.Name,
            FiscalYearId = item.OPCR.FiscalYearId,
            FiscalYear = item.OPCR.FiscalYear.Year,
            KPIName = item.KPIAssignment.FYActiveKPI != null ? item.KPIAssignment.FYActiveKPI.Name : string.Empty,
            DistributionBehavior = item.KPIAssignment.FYActiveKPI != null ? item.KPIAssignment.FYActiveKPI.DistributionBehavior : string.Empty,
            MeasurementUnit = item.KPIAssignment.FYActiveKPI != null ? item.KPIAssignment.FYActiveKPI.MeasurementUnit : string.Empty,
            AssignedTargetAnnual = item.KPIAssignment.AssignedTargetAnnual,
            AssignedTargetQ1 = item.KPIAssignment.AssignedTargetQ1,
            AssignedTargetQ2 = item.KPIAssignment.AssignedTargetQ2,
            AssignedTargetQ3 = item.KPIAssignment.AssignedTargetQ3,
            AssignedTargetQ4 = item.KPIAssignment.AssignedTargetQ4,
            IsLocked = item.KPIAssignment.IsLocked,
            IsShopped = item.IsShopped,
            Q1Target = item.Q1Target,
            Q2Target = item.Q2Target,
            Q3Target = item.Q3Target,
            Q4Target = item.Q4Target,
            ProposedAnnualTarget = item.Q1Target + item.Q2Target + item.Q3Target + item.Q4Target,
            CreatedAt = item.CreatedAt,
            CreatedBy = item.CreatedBy
        };

        var (items, totalCount) = await unitOfWork.OPCRItemRepository.GetAllAsync(sieveModel, projection, cancellationToken);

        return new PaginatedApiResponse<OPCRItemResponse>([.. items], query.PageNumber, query.PageSize, totalCount);
    }
}
