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
        var updateRequest = request.UpdateItemPrice;

        // Validate existing entity
        var entity = await unitOfWork.ItemPriceRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Item price not found.");

        // Validate ProcurementItem exists
        _ = await unitOfWork.ProcurementItemRepository.GetByIdAsync(updateRequest.ProcurementItemId, cancellationToken)
            ?? throw new NotFoundException("Procurement item not found.");

        // Validate FiscalYear exists
        _ = await unitOfWork.FiscalYearRepository.GetByIdAsync(updateRequest.FiscalYearId, cancellationToken)
            ?? throw new NotFoundException("Fiscal year not found.");

        // Check if updating to a different ProcurementItem/FiscalYear combination
        if (entity.ProcurementItemId != updateRequest.ProcurementItemId || entity.FiscalYearId != updateRequest.FiscalYearId)
        {
            // Check for existing price entry (ensure uniqueness)
            var existingPrice = await unitOfWork.ItemPriceRepository.FindAsync(
                ip => ip.ProcurementItemId == updateRequest.ProcurementItemId
                    && ip.FiscalYearId == updateRequest.FiscalYearId
                    && ip.Id != request.Id
                    && !ip.IsDeleted,
                cancellationToken
            );

            if (existingPrice != null)
                throw new ConflictException("A price entry already exists for this procurement item in the specified fiscal year.");
        }

        // Update entity
        entity.ProcurementItemId = updateRequest.ProcurementItemId;
        entity.FiscalYearId = updateRequest.FiscalYearId;
        entity.UnitPrice = updateRequest.UnitPrice;

        unitOfWork.ItemPriceRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Item price updated successfully.");
    }
}
