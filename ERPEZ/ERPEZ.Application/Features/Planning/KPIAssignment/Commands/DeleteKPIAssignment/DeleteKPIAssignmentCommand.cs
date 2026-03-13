using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIAssignment.Commands.DeleteKPIAssignment;

public record DeleteKPIAssignmentCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
