using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.DUKPIAssignment.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.DUKPIAssignment.Queries.GetDUKPIAssignments;

public record GetDUKPIAssignmentsQuery : PaginatedQuery<PaginatedApiResponse<DUKPIAssignmentResponse>>
{

}
