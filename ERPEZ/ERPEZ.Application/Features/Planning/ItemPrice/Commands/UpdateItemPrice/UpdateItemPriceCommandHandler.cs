using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ItemPrice.Commands.UpdateItemPrice;

public class UpdateItemPriceCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateItemPriceCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateItemPriceCommand request, CancellationToken cancellationToken)
    {
        // Validate existing entity
        var entity = await unitOfWork.ItemPriceRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Item price not found.");

        // Validate ProcurementItem exists
        _ = await unitOfWork.ProcurementItemRepository.GetByIdAsync(request.ProcurementItemId, cancellationToken)
            ?? throw new NotFoundException("Procurement item not found.");

        // Validate FiscalYear exists
        _ = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.FiscalYearId, cancellationToken)
            ?? throw new NotFoundException("Fiscal year not found.");

        // Check if updating to a different ProcurementItem/FiscalYear combination
        if (entity.ProcurementItemId != request.ProcurementItemId || entity.FiscalYearId != request.FiscalYearId)
        {
            // Check for existing price entry (ensure uniqueness)
            var existingPrice = await unitOfWork.ItemPriceRepository.FindAsync(
                ip => ip.ProcurementItemId == request.ProcurementItemId
                    && ip.FiscalYearId == request.FiscalYearId
                    && ip.Id != request.Id
                    && !ip.IsDeleted,
                cancellationToken
            );

            if (existingPrice != null)
                throw new ConflictException("A price entry already exists for this procurement item in the specified fiscal year.");
        }

        // Update entity
        entity.ProcurementItemId = request.ProcurementItemId;
        entity.FiscalYearId = request.FiscalYearId;
        entity.UnitPrice = request.UnitPrice;

        unitOfWork.ItemPriceRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Item price updated successfully.");
    }
}
