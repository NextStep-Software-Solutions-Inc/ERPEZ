using System.Linq.Expressions;
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

        Expression<Func<Domain.Entities.Planning.DUKPIAssignment, DUKPIAssignmentResponse>> selector = a => new DUKPIAssignmentResponse
        {
            Id = a.Id,
            KPIId = a.KPIId,
            DeliveryUnitId = a.DeliveryUnitId,
            AllocatedTargetValue = a.AllocatedTargetValue,
            TargetId = a.KPITargetId
        };

        var (kpiAssignments, totalCount) = await unitOfWork.DUKPIAssignmentRepository.GetAllAsync(sieveModel, selector, cancellationToken: cancellationToken);

    
        return new PaginatedApiResponse<DUKPIAssignmentResponse>(
            [..kpiAssignments],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
