using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Queries.GetOPCRPAPDepartmentById;

public record GetOPCRPAPDepartmentByIdQuery(Guid Id) : IRequest<ApiResponse<Domain.Entities.Planning.OPCRPAPDepartment>>;
