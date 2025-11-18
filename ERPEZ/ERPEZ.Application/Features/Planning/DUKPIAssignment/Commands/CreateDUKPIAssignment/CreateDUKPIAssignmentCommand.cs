using ERPEZ.Application.Features.Planning.DUKPIAssignment.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUKPIAssignment.Commands.CreateDUKPIAssignment;

public record CreateDUKPIAssignmentCommand : IRequest<ApiResponse<Unit>>
{
    public Guid KPIId { get; init; }
    public Guid DeliveryUnitId { get; init; }
    public List<DUKPITarget> DUKPITargets { get; init; } = [];
}

public record DUKPITarget
{
    public Guid TargetId { get; init; }
    public decimal AllocatedTargetValue { get; init; }
}
