using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DeliveryUnit.Commands.UpdateDU;

public class UpdateDeliveryUnitCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<UpdateDeliveryUnitCommand, ApiResponse<Domain.Entities.Planning.DeliveryUnit>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.DeliveryUnit>> Handle(UpdateDeliveryUnitCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateDU;
        var deliveryUnit = await _unitOfWork.DeliveryUnitRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("Delivery Unit not found.");
        if (deliveryUnit.OfficeId == dto.OfficeId  && deliveryUnit.ParentDUId == dto.ParentDUId) throw new ConflictException("Delivery Unit already exist.");

        deliveryUnit.OfficeId = dto.OfficeId ?? deliveryUnit.OfficeId;
        deliveryUnit.ParentDUId = dto.ParentDUId ?? deliveryUnit.ParentDUId;



        _unitOfWork.DeliveryUnitRepository.Update(deliveryUnit);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Domain.Entities.Planning.DeliveryUnit>.Success(deliveryUnit, "Delivery Unit updated successfully.");
    }
}
