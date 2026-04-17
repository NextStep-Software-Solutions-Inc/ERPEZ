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
            itemRequest.Status = request.Status;

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

        if (request.RequestDate.HasValue)
            itemRequest.RequestDate = request.RequestDate.Value;

        if (request.ReviewedBy.HasValue)
            itemRequest.ReviewedBy = request.ReviewedBy.Value;

        if (request.SubmittedAt.HasValue)
            itemRequest.SubmittedAt = request.SubmittedAt.Value;

        if (request.ReviewedAt.HasValue)
            itemRequest.ReviewedAt = request.ReviewedAt.Value;

        itemRequest.UpdatedAt = DateTime.UtcNow;

        unitOfWork.ItemRequestRepository.Update(itemRequest);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(itemRequest.Id, "Item Request updated successfully.");
    }
}
