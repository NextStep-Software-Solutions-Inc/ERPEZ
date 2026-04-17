using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;

namespace ERPEZ.Application.Features.Planning.PPMP.Common;

public static class PPMPItemAllocationAmountCalculator
{
    public static async Task<decimal> CalculateAmountAsync(
        IUnitOfWork unitOfWork,
        Guid ppmpItemId,
        int quantity,
        CancellationToken cancellationToken)
    {
        if (quantity <= 0)
            throw new ConflictException("Quantity must be greater than 0.");

        var unitPrice = await ResolveUnitPriceAsync(unitOfWork, ppmpItemId, cancellationToken);
        return unitPrice * quantity;
    }

    private static async Task<decimal> ResolveUnitPriceAsync(
        IUnitOfWork unitOfWork,
        Guid ppmpItemId,
        CancellationToken cancellationToken)
    {
        var itemContext = await unitOfWork.PPMPItemRepository.GetSingleAsync(
            unitOfWork.PPMPItemRepository.Query(x => x.Id == ppmpItemId)
                .Select(x => new
                {
                    x.CSEItemId,
                    x.NonCSEItemId,
                    x.UnitPrice,
                    FiscalYearId = x.PPMPExpenditureItem.PPMPActivity.PPMP.FiscalYearId
                }),
            cancellationToken);

        if (itemContext == null)
            throw new NotFoundException("PPMP Item not found.");

        if (itemContext.CSEItemId.HasValue)
        {
            var procurementItem = await unitOfWork.ProcurementItemRepository.FindAsync(
                x => x.Id == itemContext.CSEItemId.Value && x.IsCSE,
                cancellationToken);

            if (procurementItem == null)
                throw new NotFoundException("CSE Item not found.");

            if (!procurementItem.IsActive)
                throw new ConflictException("Selected CSE item is inactive.");

            var itemPrice = await unitOfWork.ItemPriceRepository.FindAsync(
                x => x.ProcurementItemId == procurementItem.Id && x.FiscalYearId == itemContext.FiscalYearId,
                cancellationToken);

            var effectivePrice = itemPrice?.UnitPrice ?? itemContext.UnitPrice;
            if (effectivePrice <= 0)
                throw new ConflictException("Unit price is not configured for the selected CSE item.");

            return effectivePrice;
        }

        if (itemContext.NonCSEItemId.HasValue)
        {
            var nonCseItem = await unitOfWork.NonCSEItemRepository.GetByIdAsync(itemContext.NonCSEItemId.Value, cancellationToken);
            if (nonCseItem == null)
                throw new NotFoundException("Non-CSE Item not found.");

            if (!nonCseItem.IsActive)
                throw new ConflictException("Selected Non-CSE item is inactive.");

            var effectivePrice = nonCseItem.CurrentPrice > 0 ? nonCseItem.CurrentPrice : itemContext.UnitPrice;
            if (effectivePrice <= 0)
                throw new ConflictException("Unit price is not configured for the selected Non-CSE item.");

            return effectivePrice;
        }

        if (itemContext.UnitPrice <= 0)
            throw new ConflictException("Unit price is not configured for this PPMP item.");

        return itemContext.UnitPrice;
    }
}
