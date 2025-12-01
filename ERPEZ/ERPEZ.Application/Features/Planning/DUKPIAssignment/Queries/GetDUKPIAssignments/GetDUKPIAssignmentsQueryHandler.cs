using ERPEZ.Application.Features.Planning.DUKPIAssignment.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using ERPEZ.Domain.Dtos.Planning;

namespace ERPEZ.Application.Features.Planning.DUKPIAssignment.Queries.GetDUKPIAssignments;

public class GetDUKPIAssignmentsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetDUKPIAssignmentsQuery, PaginatedApiResponse<DUKPIAssignmentsGroupedResponse>>
{
    public async Task<PaginatedApiResponse<DUKPIAssignmentsGroupedResponse>> Handle(GetDUKPIAssignmentsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        
        var (groupedAssignments, totalCount) = await unitOfWork.DUKPIAssignmentRepository.GetGroupedAssignmentsAsync(sieveModel, cancellationToken);

        return new PaginatedApiResponse<DUKPIAssignmentsGroupedResponse>(
            groupedAssignments,
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
