using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DeliveryUnit.Commands.CreateDU;

public class CreateDeliveryUnitCommand : IRequest<ApiResponse<Guid>>
{
    public Guid OfficeId { get; set; }
    public Guid? ParentDUId { get; set; }
}
