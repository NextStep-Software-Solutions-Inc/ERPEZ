using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementItem.Commands.UpdateProcurementItem;

public class UpdateProcurementItemCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateProcurementItemCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateProcurementItemCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.ProcurementItemRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Procurement item not found.");

        if (!string.IsNullOrEmpty(request.Name))
        {
            // Check for duplicates
            var existing = await unitOfWork.ProcurementItemRepository.FindAsync(
                x => x.Name == request.Name && x.Id != request.Id && !x.IsDeleted,
                cancellationToken
            );

            if (existing != null)
                throw new ConflictException($"Procurement item with name '{request.Name}' already exists.");

            entity.Name = request.Name;
        }

        if (request.Specifications != null)
            entity.Specifications = request.Specifications;

        if (!string.IsNullOrEmpty(request.Type))
            entity.Type = request.Type;

        if (request.IsCSE.HasValue)
            entity.IsCSE = request.IsCSE.Value;

        if (request.ItemLife.HasValue)
            entity.ItemLife = request.ItemLife;

        if (request.ProductCode != null)
            entity.ProductCode = request.ProductCode;

        if (request.ImageURL != null)
            entity.ImageURL = request.ImageURL;

        if (request.IsActive.HasValue)
            entity.IsActive = request.IsActive.Value;

        if (request.ObjectCodeId.HasValue)
        {
            // Validate object code exists
            _ = await unitOfWork.ObjectRepository.GetByIdAsync(request.ObjectCodeId.Value, cancellationToken)
                ?? throw new NotFoundException("Object code not found.");

            entity.ObjectCodeId = request.ObjectCodeId.Value;
        }

        if (request.UNSPSCCodeId.HasValue)
        {
            // Validate UNSPSC code exists
            _ = await unitOfWork.UNSPSCCodeRepository.GetByIdAsync(request.UNSPSCCodeId.Value, cancellationToken)
                ?? throw new NotFoundException("UNSPSC code not found.");

            entity.UNSPSCCodeId = request.UNSPSCCodeId.Value;
        }

        if (request.UOMId.HasValue)
        {
            // Validate UOM exists
            _ = await unitOfWork.UOMRepository.GetByIdAsync(request.UOMId.Value, cancellationToken)
                ?? throw new NotFoundException("Unit of measure not found.");

            entity.UOMId = request.UOMId.Value;
        }

        unitOfWork.ProcurementItemRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Procurement item updated successfully.");
    }
}
