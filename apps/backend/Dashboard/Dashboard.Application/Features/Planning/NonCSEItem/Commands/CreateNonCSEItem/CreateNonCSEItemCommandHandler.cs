using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.NonCSEItem.Commands.CreateNonCSEItem;

public class CreateNonCSEItemCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<CreateNonCSEItemCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateNonCSEItemCommand request, CancellationToken cancellationToken)
    {
        // Validate UOM if provided
        if (request.UOMId.HasValue)
        {
            var uom = await unitOfWork.UOMRepository.GetByIdAsync(request.UOMId.Value, cancellationToken);
            if (uom == null)
                throw new NotFoundException("UOM not found.");
        }

        // Validate Item Request if provided
        if (request.ItemRequestId.HasValue)
        {
            var itemRequest = await unitOfWork.ItemRequestRepository.GetByIdAsync(
                request.ItemRequestId.Value, cancellationToken);
            if (itemRequest == null)
                throw new NotFoundException("Item Request not found.");
        }

        // Check for duplicate Item Name
        var existingItem = await unitOfWork.NonCSEItemRepository.FindAsync(
            x => x.Name == request.Name, cancellationToken);
        if (existingItem != null)
            throw new ConflictException($"Non-CSE Item with name '{request.Name}' already exists.");

        // Create Non-CSE Item
        var nonCseItem = new Domain.Entities.Planning.NonCSEItem
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            UOMId = request.UOMId,
            ItemRequestId = request.ItemRequestId,
            ProductCode = request.ProductCode,
            CurrentPrice = request.CurrentPrice,
            Remarks = request.Remarks,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        await unitOfWork.NonCSEItemRepository.AddAsync(nonCseItem, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(nonCseItem.Id, "Non-CSE Item created successfully.");
    }
}
