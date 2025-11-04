using ERPEZ.Application.Features.Planning.DeliveryUnit.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DeliveryUnit.Commands.CreateDU;

public class CreateDeliveryUnitCommandHandler(IUnitOfWork _unitOfWork)
    : IRequestHandler<CreateDeliveryUnitCommand, ApiResponse<DeliveryUnitDto>>
{
    public async Task<ApiResponse<DeliveryUnitDto>> Handle(CreateDeliveryUnitCommand request, CancellationToken cancellationToken)
    {
        var existingDU = await _unitOfWork.DeliveryUnitRepository.FindAsync(
            du => du.OfficeId == request.OfficeId && du.ParentDUId == request.ParentDUId,
            cancellationToken: cancellationToken);

        if (existingDU != null)
            throw new ConflictException("Delivery Unit already exists.");

        var office = await _unitOfWork.OfficeRepository.GetByIdAsync(request.OfficeId, cancellationToken)
            ?? throw new NotFoundException("Office not found.");

        if (request.ParentDUId != null)
        {
            var parentDU = await _unitOfWork.DeliveryUnitRepository.GetByIdAsync(request.ParentDUId.Value, cancellationToken)
                ?? throw new NotFoundException("Parent Delivery Unit not found.");

            if (parentDU.ParentDUId != null)
                return new ApiResponse<DeliveryUnitDto>
                {
                    Message = "Parent Delivery Unit must be a top-level Delivery Unit (cannot have its own parent).",
                    Succeeded = false,
                };

            if (parentDU.OfficeId == request.OfficeId)
                return new ApiResponse<DeliveryUnitDto>
                {
                    Message = "Parent Delivery Unit cannot belong to the same Office as the new Delivery Unit.",
                    Succeeded = false,
                };
        }

        var deliveryUnit = new Domain.Entities.Planning.DeliveryUnit
        {
            OfficeId = request.OfficeId,
            ParentDUId = request.ParentDUId
        };

        await _unitOfWork.DeliveryUnitRepository.AddAsync(deliveryUnit, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new DeliveryUnitDto
        {
            Id = deliveryUnit.Id,
            OfficeId = deliveryUnit.OfficeId,
            ParentDUId = deliveryUnit.ParentDUId
        };

        return ApiResponse<DeliveryUnitDto>.Success(dto, "Delivery Unit created successfully.");
    }
}
