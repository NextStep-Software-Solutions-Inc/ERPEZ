using ERPEZ.Application.Features.Planning.DUKPIAssignment.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUKPIAssignment.Queries.GetDUKPIAssignments;

public class GetDUKPIAssignmentsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetDUKPIAssignmentsQuery, PaginatedApiResponse<DUKPIAssignmentResponse>>
{
    public async Task<PaginatedApiResponse<DUKPIAssignmentResponse>> Handle(GetDUKPIAssignmentsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        var (kpiAssignments, totalCount) = await unitOfWork.DUKPIAssignmentRepository.GetAllAsync(sieveModel, cancellationToken: cancellationToken);
        
        var groupedAssignments = kpiAssignments
            .GroupBy(a => new { a.KPIId, a.DeliveryUnitId })
            .Select(group => new DUKPIAssignmentResponse
            {
                KPIId = group.Key.KPIId,
                DeliveryUnitId = group.Key.DeliveryUnitId,
                DUKPITargets = [.. group.Select(assignment => new DUKPITargetResponse
                {
                    DUKPIAssignmentId = assignment.Id,
                    TargetId = assignment.KPITargetId,
                    AllocatedTargetValue = assignment.AllocatedTargetValue
                })]
            })
            .ToList();
        
        return new PaginatedApiResponse<DUKPIAssignmentResponse>(
            groupedAssignments,
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
