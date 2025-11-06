using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUKPIAssignment.Queries.GetDUKPIAssignments;

public class GetDUKPIAssignmentsQueryHandler(IUnitOfWork _unitOfWork) : IRequestHandler<GetDUKPIAssignmentsQuery, PaginatedApiResponse<Domain.Entities.Planning.DUKPIAssignment>>
{
    public async Task<PaginatedApiResponse<Domain.Entities.Planning.DUKPIAssignment>> Handle(GetDUKPIAssignmentsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        var (kpiAssignments, totalCount) = await _unitOfWork.DUKPIAssignmentRepository.GetAllAsync(sieveModel, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<Domain.Entities.Planning.DUKPIAssignment>(
            [.. kpiAssignments],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
