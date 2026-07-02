using ERPEZ.Application.Common.Exceptions;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Commands.UpdateAPR;

public class UpdateAPRCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateAPRCommand, Unit>
{
    public async Task<Unit> Handle(UpdateAPRCommand request, CancellationToken cancellationToken)
    {
        // 1. Load APR with details and guard status
        var apr = await unitOfWork.APRRepository.GetAPRWithDetailsAsync(request.Id, cancellationToken)
            ?? throw new InvalidOperationException("APR not found.");

        if (apr.Status != StatusEnum.Draft)
            throw new InvalidOperationException(
                $"Only APRs in Draft status can be edited. Current status: {apr.Status}.");

        // 2. Load the source APP (already known via apr.APPId) with full item/allocation details
        var app = await unitOfWork.APPRepository.GetAPPWithDetailsAsync(apr.APPId, cancellationToken)
            ?? throw new InvalidOperationException("Source APP not found.");

        var allAppItemsForApp = app.APPItems;
        var appItemIds = request.Items.Select(i => i.APPItemId).ToList();
        var selectedAppItems = allAppItemsForApp.Where(ai => appItemIds.Contains(ai.Id)).ToList();

        if (selectedAppItems.Count != appItemIds.Count)
            throw new InvalidOperationException("One or more selected line items do not belong to the source APP.");

        static (decimal qty, decimal amount) GetTotals(APPItem appItem)
        {
            var allocations = appItem.PPMPItem?.PPMPItemAllocations ?? [];
            if (allocations.Count == 0)
                return (0, 0);

            return (allocations.Sum(a => (decimal)a.Quantity), allocations.Sum(a => a.Amount));
        }

        var appApprovedBudget = allAppItemsForApp.Sum(ai => GetTotals(ai).amount);

        // 3. Update header fields
        apr.AgencyControlNumber = request.AgencyControlNumber;
        apr.AgencyAccountCode = request.AgencyAccountCode;
        apr.RequestDate = request.RequestDate;
        apr.Description = request.Description;
        apr.ModeOfDelivery = request.ModeOfDelivery;
        apr.InsufficientFundsAction = request.InsufficientFundsAction;
        apr.RequiresObR = request.RequiresObR;
        apr.RequiresCBA = request.RequiresCBA;
        apr.RequiresCompleteSpecifications = request.RequiresCompleteSpecifications;
        apr.AdditionalRemarks = request.AdditionalRemarks;

        // 4. Reconcile items: remove items no longer present, update matched ones,
        //    add new ones — full-replacement semantics.
        var existingByAppItemId = apr.APRItems.ToDictionary(i => i.APPItemId);
        var incomingAppItemIds = request.Items.Select(i => i.APPItemId).ToHashSet();

        // Remove items dropped from the request
        var toRemove = apr.APRItems.Where(i => !incomingAppItemIds.Contains(i.APPItemId)).ToList();
        foreach (var item in toRemove)
        {
            unitOfWork.APRItemRepository.Remove(item);
            apr.APRItems.Remove(item);
        }

        decimal totalAmount = 0;

        foreach (var dto in request.Items)
        {
            var appItem = selectedAppItems.First(ai => ai.Id == dto.APPItemId);

            if (appItem.PPMPItem is null)
                throw new InvalidOperationException($"Source PPMP item not found for APP item {appItem.Id}.");

            var (allocatedQty, _) = GetTotals(appItem);
            var qty = dto.QuantityRequested ?? allocatedQty;
            var unitCost = dto.UnitCost ?? appItem.PPMPItem.UnitPrice;

            if (qty <= 0)
                throw new InvalidOperationException(
                    $"No quantity found for line item {appItem.Id}. PPMPItem has no allocations and no override was supplied.");

            var totalCost = unitCost * qty;
            totalAmount += totalCost;

            if (existingByAppItemId.TryGetValue(dto.APPItemId, out var existingItem))
            {
                // Update in place — preserves the item's Id and any child milestones
                existingItem.QuantityRequested = qty;
                existingItem.UnitCost = unitCost;
                existingItem.TotalCost = totalCost;
            }
            else
            {
                // New selection
                apr.APRItems.Add(new APRItem
                {
                    APRId = apr.Id,
                    APPItemId = appItem.Id,
                    PPMPItemId = appItem.PPMPItemId,
                    QuantityRequested = qty,
                    UnitCost = unitCost,
                    TotalCost = totalCost
                });
            }
        }

        apr.TotalAmount = totalAmount;

        // 5. Budget ceiling re-validation
        if (totalAmount > appApprovedBudget)
        {
            throw new InvalidOperationException(
                $"APR budget (₱{totalAmount:N0}) exceeds APP approved budget (₱{appApprovedBudget:N0}).");
        }

        try
        {
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (ConcurrencyConflictException)
        {
            // Header/item edits don't involve number generation, so a single retry
            // via resubmission is sufficient — surface the conflict to the caller.
            throw new InvalidOperationException("This APR was modified by another process. Please refresh and try again.");
        }

        return Unit.Value;
    }
}
