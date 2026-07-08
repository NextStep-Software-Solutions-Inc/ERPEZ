using ERPEZ.Shared.Common;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Domain.Enums;
using FluentValidation;
using MediatR;
 
namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.AddRFQItems;

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

        if (rfq.Status != StatusEnum.Draft && rfq.Status != StatusEnum.Returned)
        {
            return ApiResponse<bool>.Fail("Items can only be modified on Draft or Returned RFQs.");
        }

        var cprItemIds = request.Items.Select(x => x.CPRItemId).Distinct().ToList();

        if (cprItemIds.Count != request.Items.Count)
        {
            return ApiResponse<bool>.Fail("Duplicate items in request.");
        }

        var sourcedQuantities = await unitOfWork.RFQRepository.GetSourcedQuantitiesForCprItemsAsync(
            cprItemIds, excludingRfqId: rfq.Id, cancellationToken);

        // Batched fetch replaces the per-item GetByIdWithDetailsAsync call in the loop.
        var cprItems = await unitOfWork.ConsolidatedPRItemRepository
            .GetByIdsWithDetailsAsync(cprItemIds, cancellationToken);
        var cprItemsById = cprItems.ToDictionary(x => x.Id);

        foreach (var itemDto in request.Items)
        {
            if (!cprItemsById.TryGetValue(itemDto.CPRItemId, out var cprItem))
            {
                return ApiResponse<bool>.Fail($"Consolidated PR item {itemDto.CPRItemId} not found.");
            }

            // Lock (or validate) the RFQ's procurement mode from the first item added.
            if (!cprItem.ProcurementModeId.HasValue)
            {
                return ApiResponse<bool>.Fail("Consolidated PR item has no procurement mode assigned.");
            }

            if (rfq.ModeOfProcurementId is null)
            {
                rfq.ModeOfProcurementId = cprItem.ProcurementModeId.Value;
            }
            else if (rfq.ModeOfProcurementId != cprItem.ProcurementModeId.Value)
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
            sourcedQuantities.TryGetValue(itemDto.CPRItemId, out var alreadySourced);

            var existingItem = rfq.RFQItems.FirstOrDefault(i => i.CPRItemId == itemDto.CPRItemId);
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
