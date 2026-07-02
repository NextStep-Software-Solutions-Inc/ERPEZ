using ERPEZ.Application.Common.Exceptions;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Commands.UpdateAPR;

public class UpdateAPRCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateAPRCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(UpdateAPRCommand request, CancellationToken cancellationToken)
    {
        var apr = await unitOfWork.APRRepository.GetAPRWithDetailsAsync(request.Id, cancellationToken);
        if (apr is null)
            return ApiResponse<Guid>.Fail("APR not found.");

        if (apr.Status != StatusEnum.Draft)
            return ApiResponse<Guid>.Fail(
                $"Only APRs in Draft status can be edited. Current status: {apr.Status}.");

        var app = await unitOfWork.APPRepository.GetAPPWithDetailsAsync(apr.APPId, cancellationToken);
        if (app is null)
            return ApiResponse<Guid>.Fail("Source APP not found.");

        var allAppItemsForApp = app.APPItems;
        var appItemIds = request.Items.Select(i => i.APPItemId).ToList();
        var selectedAppItems = allAppItemsForApp.Where(ai => appItemIds.Contains(ai.Id)).ToList();

        if (selectedAppItems.Count != appItemIds.Count)
            return ApiResponse<Guid>.Fail("One or more selected line items do not belong to the source APP.");

        static (decimal qty, decimal amount) GetTotals(APPItem appItem)
        {
            var allocations = appItem.PPMPItem?.PPMPItemAllocations ?? [];
            return allocations.Count == 0
                ? (0, 0)
                : (allocations.Sum(a => (decimal)a.Quantity), allocations.Sum(a => a.Amount));
        }

        var appApprovedBudget = allAppItemsForApp.Sum(ai => GetTotals(ai).amount);

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

        var existingByAppItemId = apr.APRItems.ToDictionary(i => i.APPItemId);
        var incomingAppItemIds = request.Items.Select(i => i.APPItemId).ToHashSet();

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
                return ApiResponse<Guid>.Fail($"Source PPMP item not found for APP item {appItem.Id}.");

            var (allocatedQty, _) = GetTotals(appItem);
            var qty = dto.QuantityRequested ?? allocatedQty;
            var unitCost = dto.UnitCost ?? appItem.PPMPItem.UnitPrice;

            if (qty <= 0)
                return ApiResponse<Guid>.Fail(
                    $"No quantity found for line item {appItem.Id}. PPMPItem has no allocations and no override was supplied.");

            var totalCost = unitCost * qty;
            totalAmount += totalCost;

            if (existingByAppItemId.TryGetValue(dto.APPItemId, out var existingItem))
            {
                existingItem.QuantityRequested = qty;
                existingItem.UnitCost = unitCost;
                existingItem.TotalCost = totalCost;
            }
            else
            {
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

        if (totalAmount > appApprovedBudget)
            return ApiResponse<Guid>.Fail(
                $"APR budget (₱{totalAmount:N0}) exceeds APP approved budget (₱{appApprovedBudget:N0}).");

        try
        {
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (ConcurrencyConflictException)
        {
            return ApiResponse<Guid>.Fail("This APR was modified by another process. Please refresh and try again.");
        }

        return ApiResponse<Guid>.Success(apr.Id, "APR updated successfully.");
    }
}
