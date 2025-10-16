using ERPEZ.Application.Features.Planning.KPIAssignment.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIAssignment.Commands.UpdateKPIAssignment;

public class UpdateKPIAssignmentCommand : IRequest<ApiResponse<Domain.Entities.Planning.KPIAssignment>>
{
    public Guid Id { get; set; }
    public required UpdateKPIAssignmentDto UpdateKPIAssignment { get; set; }
}

