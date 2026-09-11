using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.AOBs.Queries.GetApprovedAobsAvailableForPO;

public class GetApprovedAobsAvailableForPOQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetApprovedAobsAvailableForPOQuery, ApiResponse<List<AvailableAobDto>>>
{
    public async Task<ApiResponse<List<AvailableAobDto>>> Handle(GetApprovedAobsAvailableForPOQuery request, CancellationToken cancellationToken)
    {
        // Active POs referencing AOBs
        var linkedAobIds = await unitOfWork.PurchaseOrderRepository.Query()
            .Where(po => po.SourceDocumentType == SourceDocumentTypeEnum.AOB && po.Status != StatusEnum.Returned)
            .Select(po => po.SourceDocumentId)
            .Distinct()
            .ToListAsync(cancellationToken);

        var aobs = await unitOfWork.AOBRepository.Query()
            .Include(a => a.AOBAwardedItems)
                .ThenInclude(ai => ai.WinningSupplier)
            .Include(a => a.AOBAwardedItems)
                .ThenInclude(ai => ai.RFQItem)
                    .ThenInclude(ri => ri.CPRItem)
                        .ThenInclude(ci => ci.PRItem)
                            .ThenInclude(pri => pri.PPMPItem)
            .Where(a => a.Status == StatusEnum.Approved && !linkedAobIds.Contains(a.Id))
            .OrderByDescending(a => a.AOBDate)
            .ToListAsync(cancellationToken);

        var result = aobs.Select(a =>
        {
            var firstAwarded = a.AOBAwardedItems.FirstOrDefault();
            var supplierId = firstAwarded?.WinningSupplierId ?? Guid.Empty;
            var supplierName = firstAwarded?.WinningSupplier?.Name ?? string.Empty;
            var totalAmount = a.AOBAwardedItems.Sum(ai => ai.TotalAwardedAmount > 0 ? ai.TotalAwardedAmount : (ai.AwardedQuantity * ai.AwardedUnitPrice));

            var items = a.AOBAwardedItems.Select(ai => new AvailableAobItemDto
            {
                Id = ai.Id,
                RFQItemId = ai.RFQItemId,
                ItemName = !string.IsNullOrWhiteSpace(ai.RFQItem?.ItemNameSnapshot)
                    ? ai.RFQItem.ItemNameSnapshot
                    : (ai.RFQItem?.CPRItem?.PRItem?.Name ?? "Item"),
                Quantity = ai.AwardedQuantity,
                Unit = ai.RFQItem?.CPRItem?.PRItem?.PPMPItem?.Unit ?? "unit",
                UnitPrice = ai.AwardedUnitPrice,
                TotalAmount = ai.TotalAwardedAmount > 0 ? ai.TotalAwardedAmount : (ai.AwardedQuantity * ai.AwardedUnitPrice)
            }).ToList();

            return new AvailableAobDto
            {
                Id = a.Id,
                AOBNumber = a.AOBNumber,
                Description = a.Description,
                WinningSupplierId = supplierId,
                WinningSupplierName = supplierName,
                TotalAwardedAmount = totalAmount,
                AOBDate = a.AOBDate,
                AwardedItems = items
            };
        }).ToList();

        return ApiResponse<List<AvailableAobDto>>.Success(result);
    }
}
