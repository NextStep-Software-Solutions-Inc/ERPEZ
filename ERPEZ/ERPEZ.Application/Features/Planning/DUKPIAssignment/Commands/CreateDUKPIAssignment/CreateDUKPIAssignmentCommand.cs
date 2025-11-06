using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUKPIAssignment.Commands.CreateDUKPIAssignment;

public class CreateDUKPIAssignmentCommand : IRequest<ApiResponse<Domain.Entities.Planning.DUKPIAssignment>>
{
    public Guid KPIId { get; set; }
    public Guid DeliveryUnitId { get; set; }
}
