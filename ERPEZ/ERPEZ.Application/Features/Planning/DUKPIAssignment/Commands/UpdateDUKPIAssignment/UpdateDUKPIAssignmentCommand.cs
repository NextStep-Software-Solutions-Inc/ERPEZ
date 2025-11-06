using ERPEZ.Application.Features.Planning.DUKPIAssignment.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUKPIAssignment.Commands.UpdateDUKPIAssignment;

public class UpdateDUKPIAssignmentCommand : IRequest<ApiResponse<Domain.Entities.Planning.DUKPIAssignment>>
{
    public Guid Id { get; set; }
    public required UpdateDUKPIAssignmentDto UpdateDUKPIAssignment { get; set; }
}

