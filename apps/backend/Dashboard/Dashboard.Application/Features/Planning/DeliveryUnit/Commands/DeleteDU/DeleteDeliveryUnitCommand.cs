using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DeliveryUnit.Commands.DeleteDU;

public record DeleteDeliveryUnitCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
