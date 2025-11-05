using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Commands.DeleteOPCRPAPDepartment;

public record class DeleteOPCRPAPDepartmentCommand(Guid Id) : IRequest<ApiResponse<Unit>>;