using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DeliveryUnit.Commands.AssignKPIsToDeliveryUnit;

public record AssignKPIsToDeliveryUnitCommand : IRequest<ApiResponse<Unit>>
{
    public Guid DeliveryUnitId { get; init; }
    public List<KPITargetRequest> KPITargets { get; init; } = [];
}

public record KPITargetRequest
{
    public Guid KPIId { get; init; }
    public Guid TargetId { get; init; }
    public decimal AllocatedTargetValue { get; init; }
}