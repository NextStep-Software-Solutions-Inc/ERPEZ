using ERPEZ.Application.Features.Planning.DUKPIAssignment.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUKPIAssignment.Commands.UpdateDUKPIAssignment;

public class UpdateDUKPIAssignmentCommand : IRequest<ApiResponse<DUKPIAssignmentResponse>>
{
    public Guid Id { get; set; }
    public required UpdateDUKPIAssignmentResponse UpdateDUKPIAssignment { get; set; }
}

