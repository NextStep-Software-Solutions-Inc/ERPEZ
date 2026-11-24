using ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests;

/// <summary>
/// Shared validation and item-construction helpers for Purchase Request create and update handlers.
/// </summary>
internal static class PRItemValidationHelper
{
    internal static async Task<(Guid? ResolvedPpmpItemId, Guid? ResolvedAprId)> ValidatePRItemAsync(
        IUnitOfWork unitOfWork,
        PRType prType,
        Guid officeId,
        PRItemRequest itemRequest,
        Guid? currentPRId,
        CancellationToken cancellationToken)
    {
        Guid? resolvedPpmpItemId = itemRequest.PPMPItemId;
        Guid? resolvedAprId = null;

        if (prType == PRType.NonCSE && itemRequest.PPMPItemId.HasValue)
        {
            var ppmpItem = await unitOfWork.PPMPItemRepository.GetByIdWithDetailsAsync(
                itemRequest.PPMPItemId.Value, cancellationToken)
                ?? throw new NotFoundException($"PPMP Item with ID {itemRequest.PPMPItemId} not found.");

            if (ppmpItem.CSEItemId.HasValue)
                throw new ValidationException($"Item '{ppmpItem.Name}' is a CSE item and cannot be added to a Non-CSE PR.");

            var itemOfficeId = ppmpItem.PPMPExpenditureItem?.PPMP?.OfficeId
                            ?? ppmpItem.PPMPExpenditureItem?.PPMPActivity?.PPMP?.OfficeId;
            if (itemOfficeId.HasValue && itemOfficeId.Value != officeId)
                throw new ValidationException($"Item '{ppmpItem.Name}' belongs to another office and cannot be added to this Purchase Request.");

            var ppmpStatus = ppmpItem.PPMPExpenditureItem?.PPMP?.Status
                          ?? ppmpItem.PPMPExpenditureItem?.PPMPActivity?.PPMP?.Status;
            if (ppmpStatus != StatusEnum.Approved)
                throw new ValidationException($"Item '{ppmpItem.Name}' belongs to a PPMP that is not approved.");

            var isAppApproved = ppmpItem.APPItems.Any(ai => !ai.IsDeleted && !ai.APP.IsDeleted && ai.APP.Status == StatusEnum.Approved);
            if (!isAppApproved)
                throw new ValidationException($"Item '{ppmpItem.Name}' has not been consolidated into an approved Annual Procurement Plan (APP).");

            if (ppmpItem.NonCSEItemId == null)
                throw new ValidationException($"Item '{ppmpItem.Name}' is not an approved Non-CSE item.");

            await ValidatePPMPItemBudgetAsync(
                unitOfWork,
                ppmpItem,
                itemRequest.RequestedMonth,
                itemRequest.RequestedQuantity,
                itemRequest.UnitCost,
                currentPRId,
                cancellationToken);
        }
        else if (prType == PRType.OutOfStockCSE && itemRequest.APRItemId.HasValue)
        {
            var aprItem = await unitOfWork.APRItemRepository.GetByIdAsync(
                itemRequest.APRItemId.Value, cancellationToken)
                ?? throw new NotFoundException($"APR Item with ID {itemRequest.APRItemId} not found.");

            var apr = await unitOfWork.APRRepository.GetByIdAsync(aprItem.APRId, cancellationToken)
                ?? throw new NotFoundException($"APR with ID {aprItem.APRId} not found.");

            if (apr.OfficeId != officeId)
                throw new ValidationException($"Item '{itemRequest.Name}' belongs to an APR from another office and cannot be added to this Purchase Request.");

            if (apr.Status != StatusEnum.Approved)
                throw new ValidationException($"Item '{itemRequest.Name}' belongs to an APR that is not approved.");

            var existingPRItems = await unitOfWork.PRItemRepository.FindAllAsync(
                i => i.APRItemId == aprItem.Id &&
                    !i.PurchaseRequest.IsDeleted &&
                    i.PurchaseRequest.Status != StatusEnum.Returned &&
                    (!currentPRId.HasValue || i.PurchaseRequestId != currentPRId.Value),
                cancellationToken);

            var totalReserved = existingPRItems.Sum(i => i.RequestedQuantity);
            var available = (int)aprItem.QuantityRequested - totalReserved;

            if (itemRequest.RequestedQuantity > available)
                throw new ValidationException($"Requested quantity {itemRequest.RequestedQuantity} for '{itemRequest.Name}' exceeds available APR deficit ({available}).");

            resolvedPpmpItemId ??= aprItem.PPMPItemId;
            resolvedAprId = aprItem.APRId;
        }

        return (resolvedPpmpItemId, resolvedAprId);
    }

    internal static async Task ValidatePPMPItemBudgetAsync(
        IUnitOfWork unitOfWork,
        PPMPItem ppmpItem,
        AllocationMonthEnum requestedMonth,
        int requestedQty,
        decimal requestedUnitCost,
        Guid? currentPRId,
        CancellationToken cancellationToken)
    {
        if (requestedUnitCost < 0)
            throw new ValidationException($"Unit cost for '{ppmpItem.Name}' cannot be negative.");

        var hasMonthlyAllocations = ppmpItem.PPMPItemAllocations.Any(a => !a.IsDeleted && a.Quantity > 0);

        var existingItems = await unitOfWork.PRItemRepository.FindAllAsync(
            i => i.PPMPItemId == ppmpItem.Id &&
                (!hasMonthlyAllocations || i.RequestedMonth == requestedMonth) &&
                !i.PurchaseRequest.IsDeleted &&
                i.PurchaseRequest.Status != StatusEnum.Returned &&
                (!currentPRId.HasValue || i.PurchaseRequestId != currentPRId.Value),
            cancellationToken);

        var totalAllocated = hasMonthlyAllocations
            ? ppmpItem.PPMPItemAllocations
                .Where(a => !a.IsDeleted && a.AllocationMonth == requestedMonth)
                .Sum(a => a.Quantity)
            : ppmpItem.PlannedQuantity;

        var reservedQty = existingItems.Sum(i => i.RequestedQuantity);
        var reservedCost = existingItems.Sum(i => i.Amount);
        var ppmpBudget = ppmpItem.UnitPrice * totalAllocated;
        var newCost = requestedQty * requestedUnitCost;

        var scopeLabel = hasMonthlyAllocations ? $" in month {requestedMonth}" : string.Empty;

        if (reservedQty + requestedQty > totalAllocated)
            throw new ValidationException(
                $"Requested quantity for '{ppmpItem.Name}'{scopeLabel} exceeds PPMP allocation. Available: {totalAllocated - reservedQty}, Requested: {requestedQty}.");

        if (reservedCost + newCost > ppmpBudget)
            throw new ValidationException(
                $"Requested amount for '{ppmpItem.Name}'{scopeLabel} exceeds PPMP budget. Remaining: ₱{ppmpBudget - reservedCost:N2}, Requested: ₱{newCost:N2}.");
    }

    internal static PRItem BuildPRItem(PRItemRequest req, Guid? resolvedPpmpItemId = null) => new()
    {
        PPMPItemId = resolvedPpmpItemId ?? req.PPMPItemId,
        APRItemId = req.APRItemId,
        Name = req.Name,
        Description = req.Description,
        UnitCost = req.UnitCost,
        RequestedQuantity = req.RequestedQuantity,
        Amount = req.RequestedQuantity * req.UnitCost,
        StockNo = req.StockNo,
        IsNonCSE = req.IsNonCSE,
        RequestedMonth = req.RequestedMonth
    };
}
