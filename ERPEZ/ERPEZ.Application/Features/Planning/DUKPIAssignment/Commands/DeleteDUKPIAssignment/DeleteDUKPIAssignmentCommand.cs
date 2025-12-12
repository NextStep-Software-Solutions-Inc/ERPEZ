using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUKPIAssignment.Commands.DeleteDUKPIAssignment;

public record DeleteDUKPIAssignmentCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
