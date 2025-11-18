using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DeliveryUnit.Commands.DeleteDU;

public class DeleteDeliveryUnitCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteDeliveryUnitCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteDeliveryUnitCommand request, CancellationToken cancellationToken)
    {
        var deliveryUnit = await unitOfWork.DeliveryUnitRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("Delivery Unit not found.");

        unitOfWork.DeliveryUnitRepository.Remove(deliveryUnit);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"Delivery Unit with ID {request.Id} deleted successfully.");
    }
}
