using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIAssignment.Commands.CreateKPIAssignment;

public class CreateKPIAssignmentCommand : IRequest<ApiResponse<Domain.Entities.Planning.KPIAssignment>>
{
    public Guid KPIId { get; set; }
    public Guid DeliveryUnitId { get; set; }
}
