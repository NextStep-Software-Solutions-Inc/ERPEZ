using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DeliveryUnit.Commands.DeleteDU;

public record class DeleteDeliveryUnitCommand(Guid Id) : IRequest<ApiResponse<Unit>>;