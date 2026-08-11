using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.DUKPITargetAssignment.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.DUKPITargetAssignment.Queries.GetDUKPITargetAssignments;

public record GetDUKPITargetAssignmentsQuery : PaginatedQuery<PaginatedApiResponse<DUKPITargetAssignmentResponse>>
{

}
