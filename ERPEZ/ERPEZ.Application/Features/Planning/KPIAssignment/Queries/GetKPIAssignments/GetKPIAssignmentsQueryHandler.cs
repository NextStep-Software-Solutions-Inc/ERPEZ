using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIAssignment.Queries.GetKPIAssignments;

public class GetKPIAssignmentsQueryHandler(IUnitOfWork _unitOfWork) : IRequestHandler<GetKPIAssignmentsQuery, PaginatedApiResponse<Domain.Entities.Planning.KPIAssignment>>
{
    public async Task<PaginatedApiResponse<Domain.Entities.Planning.KPIAssignment>> Handle(GetKPIAssignmentsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        var (kpiAssignments, totalCount) = await _unitOfWork.KPIAssignmentRepository.GetAllAsync(sieveModel, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<Domain.Entities.Planning.KPIAssignment>(
            [.. kpiAssignments],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
