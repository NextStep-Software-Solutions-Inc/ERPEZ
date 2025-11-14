using ERPEZ.Application.Features.Planning.DUKPIAssignment.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUKPIAssignment.Commands.CreateDUKPIAssignment;

public class CreateDUKPIAssignmentCommand : IRequest<ApiResponse<DUKPIAssignmentResponse>>
{
    public Guid KPIId { get; set; }
    public Guid DeliveryUnitId { get; set; }
    public Guid KPITargetId { get; set; }
    public decimal AllocatedTargetValue { get; set; }
}
