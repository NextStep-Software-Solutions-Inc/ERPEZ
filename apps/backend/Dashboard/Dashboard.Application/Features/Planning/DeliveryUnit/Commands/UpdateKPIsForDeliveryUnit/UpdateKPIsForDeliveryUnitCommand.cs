using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DeliveryUnit.Commands.UpdateKPIsForDeliveryUnit
{
    public record UpdateKPIsForDeliveryUnitCommand : IRequest<ApiResponse<Unit>>
    {
        public Guid DeliveryUnitId { get; init; }
        public List<KPITargetUpdateRequest> KPITargetUpdates { get; init; } = [];
    }

    public record KPITargetUpdateRequest
    {
        public Guid KPIId { get; init; }
        public Guid TargetId { get; init; }
        public decimal AllocatedTargetValue { get; init; }
    }
}

