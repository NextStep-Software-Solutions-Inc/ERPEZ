using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.AOBs.Commands.AwardAOB;

public class AwardAOBCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<AwardAOBCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(AwardAOBCommand request, CancellationToken cancellationToken)
    {
        // 1. Verify AOB exists
        var aob = await unitOfWork.AOBRepository.Query()
            .Include(a => a.AOBAwardedItems)
            .FirstOrDefaultAsync(a => a.Id == request.AOBId && !a.IsDeleted, cancellationToken);

        if (aob == null)
        {
            return ApiResponse<Unit>.Fail("Abstract of Bids (AOB) not found.");
        }

        // Status guard before awarding
        if (aob.Status == StatusEnum.Approved)
        {
            return ApiResponse<Unit>.Fail("This Abstract of Bids (AOB) has already been approved and cannot be re-awarded.");
        }

        // 2. Validate suppliers exist
        var supplierIds = request.AwardedItems.Select(x => x.WinningSupplierId).Distinct().ToList();
        var existingSuppliersCount = await unitOfWork.SupplierRepository.Query()
            .Where(s => supplierIds.Contains(s.Id))
            .CountAsync(cancellationToken);

        if (existingSuppliersCount != supplierIds.Count)
        {
            return ApiResponse<Unit>.Fail("One or more winning suppliers do not exist.");
        }

        // 3. Validate RFQ items exist
        var rfqItemIds = request.AwardedItems.Select(x => x.RFQItemId).Distinct().ToList();
        var rfqItems = await unitOfWork.RFQRepository.Query()
            .SelectMany(r => r.RFQItems)
            .Where(i => rfqItemIds.Contains(i.Id))
            .ToDictionaryAsync(i => i.Id, cancellationToken);

        if (rfqItems.Count != rfqItemIds.Count)
        {
            return ApiResponse<Unit>.Fail("One or more RFQ items do not exist.");
        }

        // 4. Clear existing awards
        unitOfWork.AOBAwardedItemRepository.RemoveRange(aob.AOBAwardedItems);
        aob.AOBAwardedItems.Clear();

        // 5. Add new awards
        foreach (var item in request.AwardedItems)
        {
            var rfqItem = rfqItems[item.RFQItemId];
            var qty = item.AwardedQuantity > 0 ? item.AwardedQuantity : rfqItem.Quantity;
            var totalAmount = item.TotalAwardedAmount > 0 ? item.TotalAwardedAmount : (item.AwardedUnitPrice * qty);

            aob.AOBAwardedItems.Add(new AOBAwardedItem
            {
                RFQItemId = item.RFQItemId,
                WinningSupplierId = item.WinningSupplierId,
                AwardedUnitPrice = item.AwardedUnitPrice,
                AwardedQuantity = qty,
                TotalAwardedAmount = totalAmount,
                Score = item.Score,
                AwardReason = item.AwardReason,
                PurchaseOrderId = item.PurchaseOrderId
            });
        }

        aob.UpdatedAt = DateTime.UtcNow;
        aob.UpdatedBy = "System";

        unitOfWork.AOBRepository.Update(aob);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "AOB winners selected and stored successfully.");
    }
}
