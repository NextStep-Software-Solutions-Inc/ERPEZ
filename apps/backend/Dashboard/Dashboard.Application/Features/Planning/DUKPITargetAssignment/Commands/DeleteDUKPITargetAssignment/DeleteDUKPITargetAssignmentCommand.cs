using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUKPITargetAssignment.Commands.DeleteDUKPITargetAssignment;

public record DeleteDUKPITargetAssignmentCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
