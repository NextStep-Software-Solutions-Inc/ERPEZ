using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Commands.DeleteOPCRPAPDepartment;

public record DeleteOPCRPAPDepartmentCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
