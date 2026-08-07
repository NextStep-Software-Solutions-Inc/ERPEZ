using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.KPIAssignment.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.KPIAssignment.Queries.GetKPIAssignments;

public record GetKPIAssignmentsQuery : PaginatedQuery<PaginatedApiResponse<KPIAssignmentResponse>>;
