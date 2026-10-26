using ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.UpdatePR;

public class UpdatePRCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdatePRCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdatePRCommand request, CancellationToken cancellationToken)
    {
        await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            var pr = await unitOfWork.PurchaseRequestRepository.GetPRWithDetailsAsync(request.Id, cancellationToken)
                ?? throw new NotFoundException($"Purchase Request with ID {request.Id} not found.");

            if (pr.Status != StatusEnum.Draft && pr.Status != StatusEnum.Returned)
                throw new ValidationException($"Cannot update Purchase Request in {pr.Status} status.");

            var dto = request.Dto;

            if (dto.PRNumber is not null)              pr.PRNumber              = dto.PRNumber;
            if (dto.Description is not null)           pr.Description           = dto.Description;
            if (dto.Purpose is not null)               pr.Purpose               = dto.Purpose;
            if (dto.FundSourceId is not null)         pr.FundSourceId         = dto.FundSourceId;
            if (dto.UACSCodeCombinationId is not null) pr.UACSCodeCombinationId = dto.UACSCodeCombinationId;
            if (dto.ProcurementCategoryId is not null) pr.ProcurementCategoryId = dto.ProcurementCategoryId;
            if (dto.RequestedDate is not null)         pr.RequestedDate         = dto.RequestedDate.Value;

            if (dto.Items is not null)
            {
                unitOfWork.PRItemRepository.RemoveRange(pr.PRItems.ToList());
                pr.PRItems.Clear();
                decimal total = 0;

                foreach (var itemReq in dto.Items)
                {
                    // Resolve PPMPItemId: for APR items (out-of-stock), the FE may only
                    // send APRItemId. In that case look up the APRItem to get its PPMPItemId.
                    // For independent/custom PR items, neither is provided (resolvedPpmpItemId remains null).
                    Guid? resolvedPpmpItemId = itemReq.PPMPItemId;

                    if (pr.PRType == PRType.NonCSE)
                    {
                        if (resolvedPpmpItemId.HasValue)
                        {
                            var ppmpItem = await unitOfWork.PPMPItemRepository.GetByIdWithDetailsAsync(
                                resolvedPpmpItemId.Value, cancellationToken)
                                ?? throw new NotFoundException($"PPMP Item with ID {resolvedPpmpItemId} not found.");

                            if (ppmpItem.CSEItemId.HasValue)
                                throw new ValidationException($"Item '{ppmpItem.Name}' is a CSE item and cannot be added to a Non-CSE PR.");

                            var itemOfficeId = ppmpItem.PPMPExpenditureItem?.PPMP?.OfficeId
                                            ?? ppmpItem.PPMPExpenditureItem?.PPMPActivity?.PPMP?.OfficeId;
                            if (itemOfficeId.HasValue && itemOfficeId.Value != pr.OfficeId)
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

                            await ValidatePPMPItemBudget(ppmpItem.Id, itemReq.RequestedMonth, itemReq.RequestedQuantity, ppmpItem.UnitPrice, ppmpItem, request.Id, cancellationToken);
                        }
                    }
                    else if (pr.PRType == PRType.OutOfStockCSE)
                    {
                        if (itemReq.APRItemId.HasValue)
                        {
                            var aprItem = await unitOfWork.APRItemRepository.GetByIdAsync(
                                itemReq.APRItemId.Value, cancellationToken)
                                ?? throw new NotFoundException($"APR Item with ID {itemReq.APRItemId} not found.");

                            var apr = await unitOfWork.APRRepository.GetByIdAsync(aprItem.APRId, cancellationToken)
                                ?? throw new NotFoundException($"APR with ID {aprItem.APRId} not found.");

                            if (apr.OfficeId != pr.OfficeId)
                                throw new ValidationException($"Item '{itemReq.Name}' belongs to an APR from another office and cannot be added to this Purchase Request.");

                            if (apr.Status != StatusEnum.Approved)
                                throw new ValidationException($"Item '{itemReq.Name}' belongs to an APR that is not approved.");

                            var existingPRItems = await unitOfWork.PRItemRepository.FindAllAsync(
                                i => i.APRItemId == aprItem.Id &&
                                    !i.PurchaseRequest.IsDeleted &&
                                    i.PurchaseRequest.Status != StatusEnum.Returned &&
                                    i.PurchaseRequestId != request.Id,
                                cancellationToken);

                            var totalReserved = existingPRItems.Sum(i => i.RequestedQuantity);
                            var available = (int)aprItem.QuantityRequested - totalReserved;

                            if (itemReq.RequestedQuantity > available)
                                throw new ValidationException($"Requested quantity {itemReq.RequestedQuantity} for '{itemReq.Name}' exceeds available APR deficit ({available}).");

                            resolvedPpmpItemId ??= aprItem.PPMPItemId;
                        }
                    }

                    var item = new PRItem
                    {
                        PPMPItemId        = resolvedPpmpItemId,
                        APRItemId         = itemReq.APRItemId,
                        Name              = itemReq.Name,
                        Description       = itemReq.Description,
                        UnitCost          = itemReq.UnitCost,
                        RequestedQuantity = itemReq.RequestedQuantity,
                        Amount            = itemReq.RequestedQuantity * itemReq.UnitCost,
                        StockNo           = itemReq.StockNo,
                        IsNonCSE          = itemReq.IsNonCSE,
                        RequestedMonth    = itemReq.RequestedMonth
                    };

                    pr.PRItems.Add(item);
                    total += item.Amount;
                }

                pr.TotalAmount = total;
            }

            // The entity is already tracked by EF Core, so we don't need to call Update() 
            // which would mark all navigation properties as modified.
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }, cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Purchase Request updated successfully.");
    }

    private async Task ValidatePPMPItemBudget(
        Guid ppmpItemId,
        AllocationMonthEnum requestedMonth,
        int requestedQty,
        decimal unitPrice,
        Domain.Entities.Planning.PPMPItem ppmpItem,
        Guid? currentPRId,
        CancellationToken cancellationToken)
    {
        var hasMonthlyAllocations = ppmpItem.PPMPItemAllocations.Any(a => !a.IsDeleted && a.Quantity > 0);

        if (hasMonthlyAllocations)
        {
            var existingItems = await unitOfWork.PRItemRepository.FindAllAsync(
                i => i.PPMPItemId == ppmpItemId &&
                    i.RequestedMonth == requestedMonth &&
                    !i.PurchaseRequest.IsDeleted &&
                    i.PurchaseRequest.Status != StatusEnum.Returned &&
                    (!currentPRId.HasValue || i.PurchaseRequestId != currentPRId.Value),
                cancellationToken);

            var totalAllocated   = ppmpItem.PPMPItemAllocations
                .Where(a => !a.IsDeleted && a.AllocationMonth == requestedMonth)
                .Sum(a => a.Quantity);

            var reservedQty      = existingItems.Sum(i => i.RequestedQuantity);
            var reservedCost     = existingItems.Sum(i => i.Amount);
            var ppmpBudget       = unitPrice * totalAllocated;
            var newCost          = requestedQty * unitPrice;

            if (reservedQty + requestedQty > totalAllocated)
                throw new ValidationException(
                    $"Requested quantity for '{ppmpItem.Name}' in month {requestedMonth} exceeds PPMP allocation. Available: {totalAllocated - reservedQty}, Requested: {requestedQty}.");

            if (reservedCost + newCost > ppmpBudget)
                throw new ValidationException(
                    $"Requested amount for '{ppmpItem.Name}' in month {requestedMonth} exceeds PPMP budget. Remaining: ₱{ppmpBudget - reservedCost:N2}, Requested: ₱{newCost:N2}.");
        }
        else
        {
            var existingItems = await unitOfWork.PRItemRepository.FindAllAsync(
                i => i.PPMPItemId == ppmpItemId &&
                    !i.PurchaseRequest.IsDeleted &&
                    i.PurchaseRequest.Status != StatusEnum.Returned &&
                    (!currentPRId.HasValue || i.PurchaseRequestId != currentPRId.Value),
                cancellationToken);

            var totalAllocated = ppmpItem.PlannedQuantity;
            var reservedQty    = existingItems.Sum(i => i.RequestedQuantity);
            var reservedCost   = existingItems.Sum(i => i.Amount);
            var ppmpBudget     = unitPrice * totalAllocated;
            var newCost        = requestedQty * unitPrice;

            if (reservedQty + requestedQty > totalAllocated)
                throw new ValidationException(
                    $"Requested quantity for '{ppmpItem.Name}' exceeds available PPMP planned quantity. Available: {totalAllocated - reservedQty}, Requested: {requestedQty}.");

            if (reservedCost + newCost > ppmpBudget)
                throw new ValidationException(
                    $"Requested amount for '{ppmpItem.Name}' exceeds available PPMP budget. Remaining: ₱{ppmpBudget - reservedCost:N2}, Requested: ₱{newCost:N2}.");
        }
    }
}