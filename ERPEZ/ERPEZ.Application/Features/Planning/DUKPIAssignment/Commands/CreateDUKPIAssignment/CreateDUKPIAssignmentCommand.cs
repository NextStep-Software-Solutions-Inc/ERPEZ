using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUKPIAssignment.Commands.CreateDUKPIAssignment;

public record CreateDUKPIAssignmentCommand : IRequest<ApiResponse<Unit>>
{
    public Guid DeliveryUnitId { get; init; }
    public List<DUKPITargetRequest> DUKPITargets { get; init; } = [];
}

public record DUKPITargetRequest
{
    public Guid KPIId { get; init; }
    public Guid TargetId { get; init; }
    public decimal AllocatedTargetValue { get; init; }
}
