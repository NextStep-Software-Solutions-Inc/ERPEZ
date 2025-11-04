using ERPEZ.Application.Features.Planning.DeliveryUnit.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DeliveryUnit.Commands.CreateDU;

public class CreateDeliveryUnitCommand : IRequest<ApiResponse<DeliveryUnitDto>>
{
    public Guid OfficeId { get; set; }
    public Guid? ParentDUId { get; set; }
}
