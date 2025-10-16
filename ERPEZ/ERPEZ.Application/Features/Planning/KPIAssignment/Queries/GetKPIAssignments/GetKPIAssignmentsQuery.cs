using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIAssignment.Queries.GetKPIAssignments;

public class GetKPIAssignmentsQuery : IRequest<PaginatedApiResponse<Domain.Entities.Planning.KPIAssignment>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Filters { get; set; }
    public string? Sorts { get; set; }
}
