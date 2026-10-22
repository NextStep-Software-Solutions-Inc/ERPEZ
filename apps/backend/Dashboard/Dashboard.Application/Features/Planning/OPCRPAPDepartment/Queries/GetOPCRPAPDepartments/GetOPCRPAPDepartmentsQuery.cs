using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Queries.GetOPCRPAPDepartments;

public record GetOPCRPAPDepartmentsQuery : PaginatedQuery<PaginatedApiResponse<OPCRPAPDepartmentResponse>>
{
}
