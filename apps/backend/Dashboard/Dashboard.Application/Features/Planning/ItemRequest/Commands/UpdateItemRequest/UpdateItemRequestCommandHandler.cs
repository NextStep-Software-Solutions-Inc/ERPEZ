using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ItemRequest.Commands.UpdateItemRequest;

public class UpdateItemRequestCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<UpdateItemRequestCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(UpdateItemRequestCommand request, CancellationToken cancellationToken)
    {
        // Get existing Item Request
        var itemRequest = await unitOfWork.ItemRequestRepository.GetByIdAsync(request.Id, cancellationToken);
        if (itemRequest == null)
            throw new NotFoundException("Item Request not found.");

        // Validate existing status - Approved requests cannot be modified via standard update
        if (string.Equals(itemRequest.Status, "Approved", StringComparison.OrdinalIgnoreCase))
            throw new ValidationException("Approved item requests cannot be modified.");

        // Validate UOM if provided
        if (request.UOMId.HasValue)
        {
            var uom = await unitOfWork.UOMRepository.GetByIdAsync(request.UOMId.Value, cancellationToken);
            if (uom == null)
                throw new NotFoundException("UOM not found.");
            
            itemRequest.UOMId = request.UOMId.Value;
        }

        // Validate Procurement Category if provided
        if (request.ProcurementCategoryId.HasValue)
        {
            var category = await unitOfWork.ProcurementCategoryRepository.GetByIdAsync(
                request.ProcurementCategoryId.Value, cancellationToken);
            if (category == null)
                throw new NotFoundException("Procurement Category not found.");
            
            itemRequest.ProcurementCategoryId = request.ProcurementCategoryId.Value;
        }

        // Update properties
        if (request.Name != null)
            itemRequest.Name = request.Name;

        if (request.ItemCategory != null)
            itemRequest.ItemCategory = request.ItemCategory;

        if (request.Status != null)
        {
            itemRequest.Status = request.Status;
            if (string.Equals(request.Status, "Submitted", StringComparison.OrdinalIgnoreCase) && itemRequest.SubmittedAt == null)
            {
                itemRequest.SubmittedAt = DateTime.UtcNow;
            }
            if (string.Equals(request.Status, "Approved", StringComparison.OrdinalIgnoreCase) || 
                string.Equals(request.Status, "Returned", StringComparison.OrdinalIgnoreCase))
            {
                itemRequest.ReviewedAt = DateTime.UtcNow;
            }
        }

        if (request.EstimatedUnitCost.HasValue)
            itemRequest.EstimatedUnitCost = request.EstimatedUnitCost.Value;

        if (request.TechnicalSpecification != null)
            itemRequest.TechnicalSpecification = request.TechnicalSpecification;

        if (request.TWGRemarks != null)
            itemRequest.TWGRemarks = request.TWGRemarks;

        if (request.UACSCode != null)
            itemRequest.UACSCode = request.UACSCode;

        if (request.UNSCPSCCode != null)
            itemRequest.UNSCPSCCode = request.UNSCPSCCode;

        itemRequest.UpdatedAt = DateTime.UtcNow;

        unitOfWork.ItemRequestRepository.Update(itemRequest);

        // If approved, create corresponding NonCSEItem catalog record if not already created
        if (string.Equals(itemRequest.Status, "Approved", StringComparison.OrdinalIgnoreCase))
        {
            var existingNonCseItem = await unitOfWork.NonCSEItemRepository.FindAsync(
                x => x.ItemRequestId == itemRequest.Id, cancellationToken);

            if (existingNonCseItem == null)
            {
                string itemType = "Goods";
                if (itemRequest.ProcurementCategoryId.HasValue)
                {
                    var procCat = await unitOfWork.ProcurementCategoryRepository.GetByIdAsync(
                        itemRequest.ProcurementCategoryId.Value, cancellationToken);
                    if (procCat != null && !string.IsNullOrWhiteSpace(procCat.Name))
                    {
                        itemType = procCat.Name;
                    }
                }

                var nonCseItem = new Domain.Entities.Planning.NonCSEItem
                {
                    Id = Guid.NewGuid(),
                    Name = itemRequest.Name,
                    Description = itemRequest.TechnicalSpecification,
                    UOMId = itemRequest.UOMId,
                    ItemRequestId = itemRequest.Id,
                    CurrentPrice = itemRequest.EstimatedUnitCost,
                    BaseCost = itemRequest.EstimatedUnitCost,
                    SellingPrice = itemRequest.EstimatedUnitCost,
                    Margin = 0m,
                    Type = itemType,
                    Remarks = itemRequest.TWGRemarks,
                    CreatedAt = DateTime.UtcNow
                };

                await unitOfWork.NonCSEItemRepository.AddAsync(nonCseItem, cancellationToken);
            }
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(itemRequest.Id, "Item Request updated successfully.");
    }
}
