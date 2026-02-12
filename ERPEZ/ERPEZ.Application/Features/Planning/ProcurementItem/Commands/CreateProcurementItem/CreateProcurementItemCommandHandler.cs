using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementItem.Commands.CreateProcurementItem;

public class CreateProcurementItemCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateProcurementItemCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateProcurementItemCommand request, CancellationToken cancellationToken)
    {
        // Validate ObjectCode exists
        var objectCode = await unitOfWork.ObjectRepository.GetByIdAsync(request.ObjectCodeId, cancellationToken)
            ?? throw new NotFoundException("Object code not found.");

        // Validate UNSPSCCode exists if provided
        if (request.UNSPSCCodeId.HasValue)
        {
            var unspscCode = await unitOfWork.UNSPSCCodeRepository.GetByIdAsync(request.UNSPSCCodeId.Value, cancellationToken)
                ?? throw new NotFoundException("UNSPSC code not found.");
        }

        // Validate UOM exists
        var uom = await unitOfWork.UOMRepository.GetByIdAsync(request.UOMId, cancellationToken)
            ?? throw new NotFoundException("Unit of measure not found.");

        // Check for duplicates
        var existing = await unitOfWork.ProcurementItemRepository.FindAsync(
            x => x.Name == request.Name && !x.IsDeleted,
            cancellationToken
        );

        if (existing != null)
            throw new ConflictException($"Procurement item with name '{request.Name}' already exists.");

        var entity = new Domain.Entities.Planning.ProcurementItem
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Specifications = request.Specifications,
            Type = request.Type,
            IsCSE = request.IsCSE,
            ItemLife = request.ItemLife,
            ProductCode = request.ProductCode,
            ImageURL = request.ImageURL,
            ObjectCodeId = request.ObjectCodeId,
            UNSPSCCodeId = request.UNSPSCCodeId,
            UOMId = request.UOMId,
            IsActive = true
        };

        await unitOfWork.ProcurementItemRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "Procurement item created successfully.");
    }
}
