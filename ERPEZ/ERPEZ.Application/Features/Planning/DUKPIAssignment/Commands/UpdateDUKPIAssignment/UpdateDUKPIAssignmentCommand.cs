using ERPEZ.Application.Features.Planning.DUKPIAssignment.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUKPIAssignment.Commands.UpdateDUKPIAssignment;

public record UpdateDUKPIAssignmentCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; init; }
    public required List<UpdateDUKPIAssignmentRequest> UpdateDUKPIAssignments { get; init; }
}

