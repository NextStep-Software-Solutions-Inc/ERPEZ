using ERPEZ.Application.Features.Planning.DeliveryUnit.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DeliveryUnit.Commands.UpdateDU;

public class UpdateDeliveryUnitCommand : IRequest<ApiResponse<Domain.Entities.Planning.DeliveryUnit>>
{
    public Guid Id { get; set; }
    public required UpdateDeliveryUnitDto UpdateDU { get; set; }
}
