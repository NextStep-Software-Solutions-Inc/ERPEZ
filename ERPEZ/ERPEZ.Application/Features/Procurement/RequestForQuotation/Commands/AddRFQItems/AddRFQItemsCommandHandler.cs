using ERPEZ.Shared.Common;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using FluentValidation;
using MediatR;
 
namespace ERPEZ.Application.RFQ.Commands.AddRFQItems;

public class AddRFQItemsCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<AddRFQItemsCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(AddRFQItemsCommand request, CancellationToken cancellationToken)
    {
        var rfq = await unitOfWork.RFQRepository.GetRFQWithDetailsAsync(request.RFQId, cancellationToken);
        if (rfq is null)
        {
            return ApiResponse<bool>.Fail("RFQ not found.");
        }
 
        foreach (var itemDto in request.Items)
        {
            var cprItem = await unitOfWork.ConsolidatedPRItemRepository.GetByIdWithDetailsAsync(itemDto.CPRItemId, cancellationToken);
            if (cprItem is null)
            {
                return ApiResponse<bool>.Fail($"Consolidated PR item {itemDto.CPRItemId} not found.");
            }
 
            // Lock (or validate) the RFQ's procurement mode from the first item added.
            if (rfq.ModeOfProcurementId is null)
            {
                rfq.ModeOfProcurementId = cprItem.ProcurementModeId;
            }
            else if (cprItem.ProcurementModeId.HasValue && rfq.ModeOfProcurementId != cprItem.ProcurementModeId)
            {
                return ApiResponse<bool>.Fail(
                    "All items in an RFQ must be sourced from Consolidated PR items assigned the same procurement mode.");
            }
 
            var prItem = cprItem.PRItem;
            if (prItem is null)
            {
                return ApiResponse<bool>.Fail("Consolidated PR item is missing its source PR item.");
            }
 
            // GPPB double-sourcing guard: total sourced quantity across non-Returned RFQs
            // (excluding this RFQ's own existing rows for this CPR item, since we may be updating) must not exceed RequestedQuantity.
            var alreadySourced = await unitOfWork.RFQRepository.GetSourcedQuantityForCprItemAsync(
                itemDto.CPRItemId, excludingRfqId: rfq.Id, cancellationToken);
 
            var existingItem = rfq.RFQItems.FirstOrDefault(i => i.CPRItemId == itemDto.CPRItemId);
            var previousQuantityOnThisRfq = existingItem?.Quantity ?? 0;
 
            if (alreadySourced + itemDto.Quantity > prItem.RequestedQuantity)
            {
                return ApiResponse<bool>.Fail(
                    $"Requested quantity for '{prItem.Name}' exceeds the remaining unsourced quantity " +
                    $"({prItem.RequestedQuantity - alreadySourced} remaining).");
            }
 
            // Resolve snapshot fields.
            var purchaseRequest = prItem.PurchaseRequest;
            var categorySnapshot = purchaseRequest?.ProcurementCategory?.Name
                ?? prItem.PPMPItem?.ProcurementMode?.ProcurementCategory?.Name;
            var fundSnapshot = purchaseRequest?.FundSource?.Name;
 
            if (existingItem is not null)
            {
                // Upsert: update existing row rather than duplicating (unique index on RFQId+CPRItemId enforces this anyway).
                existingItem.Quantity = itemDto.Quantity;
                existingItem.IsBrochureRequired = itemDto.IsBrochureRequired;
                existingItem.GreenSpecification = itemDto.GreenSpecification;
                existingItem.UnitPriceSnapshot = prItem.UnitCost;
                existingItem.ItemNameSnapshot = prItem.Name;
                existingItem.CategorySnapshot = categorySnapshot;
                existingItem.FundSnapshot = fundSnapshot;
            }
            else
            {
                rfq.RFQItems.Add(new RFQItem
                {
                    RFQId = rfq.Id,
                    CPRItemId = itemDto.CPRItemId,
                    Quantity = itemDto.Quantity,
                    IsBrochureRequired = itemDto.IsBrochureRequired,
                    GreenSpecification = itemDto.GreenSpecification,
                    UnitPriceSnapshot = prItem.UnitCost,
                    ItemNameSnapshot = prItem.Name,
                    CategorySnapshot = categorySnapshot,
                    FundSnapshot = fundSnapshot
                });
            }
        }
 
        rfq.TotalAmount = rfq.RFQItems.Sum(i => i.Quantity * i.UnitPriceSnapshot);
 
        unitOfWork.RFQRepository.Update(rfq);
        await unitOfWork.SaveChangesAsync(cancellationToken);
 
        return ApiResponse<bool>.Success(true);
    }
}
