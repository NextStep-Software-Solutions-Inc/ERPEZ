using System.Linq.Expressions;
using ERPEZ.Application.Features.Planning.DUKPITargetAssignment.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUKPITargetAssignment.Queries.GetDUKPITargetAssignments;

public class GetDUKPITargetAssignmentsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetDUKPITargetAssignmentsQuery, PaginatedApiResponse<DUKPITargetAssignmentResponse>>
{
    public async Task<PaginatedApiResponse<DUKPITargetAssignmentResponse>> Handle(GetDUKPITargetAssignmentsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.DUKPITargetAssignment, DUKPITargetAssignmentResponse>> selector = a => new DUKPITargetAssignmentResponse
        {
            Id = a.Id,
            KPIId = a.KPIId,
            DeliveryUnitId = a.DeliveryUnitId,
            AllocatedTargetValue = a.AllocatedTargetValue,
            TargetId = a.KPITargetId
        };

        var (kpiTargetAssignments, totalCount) = await unitOfWork.DUKPITargetAssignmentRepository.GetAllAsync(sieveModel, selector, cancellationToken: cancellationToken);

    
        return new PaginatedApiResponse<DUKPITargetAssignmentResponse>(
            [..kpiTargetAssignments],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
