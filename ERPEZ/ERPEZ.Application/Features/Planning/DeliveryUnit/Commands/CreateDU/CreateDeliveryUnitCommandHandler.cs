using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DeliveryUnit.Commands.CreateDU;

public class CreateDeliveryUnitCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateDeliveryUnitCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateDeliveryUnitCommand request, CancellationToken cancellationToken)
    {
        var existingDU = await unitOfWork.DeliveryUnitRepository.FindAsync(
            du => du.OfficeId == request.OfficeId && du.ParentDUId == request.ParentDUId,
            cancellationToken: cancellationToken);

        if (existingDU != null)
            throw new ConflictException("Delivery Unit already exists.");

        var office = await unitOfWork.OfficeRepository.GetByIdAsync(request.OfficeId, cancellationToken)
            ?? throw new NotFoundException("Office not found.");

        if (request.ParentDUId != null)
        {
            var parentDU = await unitOfWork.DeliveryUnitRepository.GetByIdAsync(request.ParentDUId.Value, cancellationToken)
                ?? throw new NotFoundException("Parent Delivery Unit not found.");

            if (parentDU.ParentDUId != null)
                return new ApiResponse<Guid>
                {
                    Message = "Parent Delivery Unit must be a top-level Delivery Unit (cannot have its own parent).",
                    Succeeded = false,
                };

            if (parentDU.OfficeId == request.OfficeId)
                return new ApiResponse<Guid>
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

        await unitOfWork.DeliveryUnitRepository.AddAsync(deliveryUnit, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        
        return ApiResponse<Guid>.Success(deliveryUnit.Id, "Delivery Unit created successfully.");
    }
}
