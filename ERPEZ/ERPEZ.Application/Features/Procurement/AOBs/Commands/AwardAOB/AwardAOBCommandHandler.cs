using ERPEZ.Domain.Entities.Procurement;
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
            .FirstOrDefaultAsync(a => a.Id == request.AOBId, cancellationToken);

        if (aob == null)
        {
            return ApiResponse<Unit>.Fail("Abstract of Bids (AOB) not found.");
        }

        // Status guard before awarding
        if (string.Equals(aob.Status, "APPROVED", StringComparison.OrdinalIgnoreCase))
        {
            return ApiResponse<Unit>.Fail("This Abstract of Bids (AOB) has already been approved and awarded.");
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

        // 3. Validate APP items exist
        var appItemIds = request.AwardedItems.Select(x => x.APPItemId).Distinct().ToList();
        var existingItemsCount = await unitOfWork.APPItemRepository.Query()
            .Where(i => appItemIds.Contains(i.Id))
            .CountAsync(cancellationToken);

        if (existingItemsCount != appItemIds.Count)
        {
            return ApiResponse<Unit>.Fail("One or more APP items do not exist.");
        }

        // 4. Clear existing awards
        unitOfWork.AOBAwardedItemRepository.RemoveRange(aob.AOBAwardedItems);
        aob.AOBAwardedItems.Clear();

        // 5. Add new awards
        foreach (var item in request.AwardedItems)
        {
            aob.AOBAwardedItems.Add(new AOBAwardedItem
            {
                APPItemId = item.APPItemId,
                WinningSupplierId = item.WinningSupplierId,
                AwardedUnitPrice = item.AwardedUnitPrice,
                Score = item.Score
            });
        }

        aob.Status = "APPROVED";

        unitOfWork.AOBRepository.Update(aob);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "AOB winners selected and stored successfully. AOB status updated to APPROVED.");
    }
}
