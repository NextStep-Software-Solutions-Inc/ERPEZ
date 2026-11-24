using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.NonCSEItem.Commands.UpdateNonCSEItem;

public class UpdateNonCSEItemCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<UpdateNonCSEItemCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(UpdateNonCSEItemCommand request, CancellationToken cancellationToken)
    {
        // Get existing Non-CSE Item
        var nonCseItem = await unitOfWork.NonCSEItemRepository.GetByIdAsync(request.Id, cancellationToken);
        if (nonCseItem == null)
            throw new NotFoundException("Non-CSE Item not found.");

        // Validate UOM if provided
        if (request.UOMId.HasValue)
        {
            var uom = await unitOfWork.UOMRepository.GetByIdAsync(request.UOMId.Value, cancellationToken);
            if (uom == null)
                throw new NotFoundException("UOM not found.");
            
            nonCseItem.UOMId = request.UOMId.Value;
        }

        // Validate Item Request if provided
        if (request.ItemRequestId.HasValue)
        {
            var itemRequest = await unitOfWork.ItemRequestRepository.GetByIdAsync(
                request.ItemRequestId.Value, cancellationToken);
            if (itemRequest == null)
                throw new NotFoundException("Item Request not found.");
            
            nonCseItem.ItemRequestId = request.ItemRequestId.Value;
        }

        // Check for duplicate Item Name if being updated
        if (request.Name != null && request.Name != nonCseItem.Name)
        {
            var existingItem = await unitOfWork.NonCSEItemRepository.FindAsync(
                x => x.Name == request.Name, cancellationToken);
            if (existingItem != null)
                throw new ConflictException($"Non-CSE Item with name '{request.Name}' already exists.");
        }

        // Update properties
        if (request.Name != null)
            nonCseItem.Name = request.Name;

        if (request.Description != null)
            nonCseItem.Description = request.Description;

        if (request.ProductCode != null)
            nonCseItem.ProductCode = request.ProductCode;

        if (request.CurrentPrice.HasValue)
            nonCseItem.CurrentPrice = request.CurrentPrice.Value;

        if (request.Remarks != null)
            nonCseItem.Remarks = request.Remarks;

        nonCseItem.UpdatedAt = DateTime.UtcNow;

        unitOfWork.NonCSEItemRepository.Update(nonCseItem);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(nonCseItem.Id, "Non-CSE Item updated successfully.");
    }
}
