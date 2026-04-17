using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ItemRequest.Commands.CreateItemRequest;

public class CreateItemRequestCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<CreateItemRequestCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateItemRequestCommand request, CancellationToken cancellationToken)
    {
        // Validate Office exists
        var office = await unitOfWork.OfficeRepository.GetByIdAsync(request.OfficeId, cancellationToken);
        if (office == null)
            throw new NotFoundException("Office not found.");

        // Validate UOM if provided
        if (request.UOMId.HasValue)
        {
            var uom = await unitOfWork.UOMRepository.GetByIdAsync(request.UOMId.Value, cancellationToken);
            if (uom == null)
                throw new NotFoundException("UOM not found.");
        }

        // Validate Procurement Category if provided
        if (request.ProcurementCategoryId.HasValue)
        {
            var category = await unitOfWork.ProcurementCategoryRepository.GetByIdAsync(
                request.ProcurementCategoryId.Value, cancellationToken);
            if (category == null)
                throw new NotFoundException("Procurement Category not found.");
        }

        // Create Item Request
        var itemRequest = new Domain.Entities.Planning.ItemRequest
        {
            Id = Guid.NewGuid(),
            OfficeId = request.OfficeId,
            UOMId = request.UOMId,
            ProcurementCategoryId = request.ProcurementCategoryId,
            Name = request.Name,
            ItemCategory = request.ItemCategory,
            Status = request.Status,
            EstimatedUnitCost = request.EstimatedUnitCost,
            TechnicalSpecification = request.TechnicalSpecification,
            TWGRemarks = request.TWGRemarks,
            UACSCode = request.UACSCode,
            UNSCPSCCode = request.UNSCPSCCode,
            RequestDate = request.RequestDate,
            ReviewedBy = request.ReviewedBy,
            SubmittedAt = request.SubmittedAt,
            ReviewedAt = request.ReviewedAt,
            CreatedAt = DateTime.UtcNow
        };

        await unitOfWork.ItemRequestRepository.AddAsync(itemRequest, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(itemRequest.Id, "Item Request created successfully.");
    }
}
