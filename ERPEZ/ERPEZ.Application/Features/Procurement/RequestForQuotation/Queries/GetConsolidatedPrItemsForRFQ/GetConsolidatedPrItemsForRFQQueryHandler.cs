using ERPEZ.Application.Features.Procurement.RequestForQuotation.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Queries.GetConsolidatedPrItemsForRfq;

public class GetConsolidatedPrItemsForRfqQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetConsolidatedPrItemsForRfqQuery, ApiResponse<List<ConsolidatedPrItemForRfqDto>>>
{
    public async Task<ApiResponse<List<ConsolidatedPrItemForRfqDto>>> Handle(
        GetConsolidatedPrItemsForRfqQuery request, CancellationToken cancellationToken)
    {
        // Only CPRs that are Approved are eligible to be sourced into an RFQ.
        // Requires ConsolidatedPRRepository.GetAllApprovedWithDetailsAsync() from the earlier patch.
        var approvedCprs = await unitOfWork.ConsolidatedPRRepository.GetAllApprovedWithDetailsAsync(cancellationToken);

        var result = new List<ConsolidatedPrItemForRfqDto>();

        foreach (var cpr in approvedCprs)
        {
            foreach (var cprItem in cpr.ConsolidatedPRItems.Where(i => !i.IsDeleted))
            {
                var prItem = cprItem.PRItem;
                if (prItem is null) continue;

                var alreadySourced = await unitOfWork.RFQRepository.GetSourcedQuantityForCprItemAsync(
                    cprItem.Id, excludingRfqId: null, cancellationToken);

                // Skip items that are fully sourced already — nothing left to offer the RFQ.
                if (alreadySourced >= prItem.RequestedQuantity) continue;

                var purchaseRequest = prItem.PurchaseRequest;
                var category = purchaseRequest?.ProcurementCategory?.Name
                    ?? prItem.PPMPItem?.ProcurementMode?.ProcurementCategory?.Name;
                var fund = purchaseRequest?.FundSource?.Name;

                // Jan-Dec breakdown: one row per monthly quantity, per UI spec.
                foreach (var monthlyQty in prItem.MonthlyQuantities.Where(m => !m.IsDeleted))
                {
                    result.Add(new ConsolidatedPrItemForRfqDto
                    {
                        CPRItemId = cprItem.Id,
                        ConsolidatedPRId = cpr.Id,
                        CPRNumber = cpr.CPRNumber,
                        ItemName = prItem.Name,
                        Category = category,
                        Fund = fund,
                        Month = monthlyQty.Month,
                        UnitCost = prItem.UnitCost,
                        RequestedQuantity = prItem.RequestedQuantity,
                        AlreadySourcedQuantity = alreadySourced,
                        ProcurementModeId = cprItem.ProcurementModeId ?? Guid.Empty,
                        ProcurementModeName = cprItem.ProcurementMode?.Name
                    });
                }
            }
        }

        return ApiResponse<List<ConsolidatedPrItemForRfqDto>>.Success(result);
    }
}
