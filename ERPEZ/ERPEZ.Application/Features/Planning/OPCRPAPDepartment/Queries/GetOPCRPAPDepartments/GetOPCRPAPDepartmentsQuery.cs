using ERPEZ.Application.Common.Queries;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Queries.GetOPCRPAPDepartments;

public record GetOPCRPAPDepartmentsQuery : PaginatedQuery<PaginatedApiResponse<Domain.Entities.Planning.OPCRPAPDepartment>>
{
}
