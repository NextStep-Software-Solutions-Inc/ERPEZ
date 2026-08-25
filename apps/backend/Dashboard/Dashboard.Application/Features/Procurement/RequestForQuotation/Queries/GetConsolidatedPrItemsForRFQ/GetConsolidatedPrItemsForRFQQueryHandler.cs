using ERPEZ.Application.Features.Procurement.RequestForQuotation.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Queries.GetConsolidatedPrItemsForRFQ;

public class GetConsolidatedPrItemsForRFQQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetConsolidatedPrItemsForRFQQuery, ApiResponse<List<ConsolidatedPrItemForRFQDto>>>
{
    public async Task<ApiResponse<List<ConsolidatedPrItemForRFQDto>>> Handle(
        GetConsolidatedPrItemsForRFQQuery request, CancellationToken cancellationToken)
    {
        // Only CPRs that are Approved are eligible to be sourced into an RFQ.
        var approvedCprs = await unitOfWork.ConsolidatedPRRepository.GetAllApprovedWithDetailsAsync(cancellationToken);

        var cprIds = approvedCprs.Select(c => c.Id).ToList();
        var projects = await unitOfWork.ProcurementProjectRepository.Query()
            .Include(p => p.BACResolutions)
            .Where(p => p.ConsolidatedPRId.HasValue && cprIds.Contains(p.ConsolidatedPRId.Value) && !p.IsDeleted)
            .ToListAsync(cancellationToken);

        var projectByCprId = projects
            .GroupBy(p => p.ConsolidatedPRId!.Value)
            .ToDictionary(g => g.Key, g => g.First());

        var result = new List<ConsolidatedPrItemForRFQDto>();

        foreach (var cpr in approvedCprs)
        {
            projectByCprId.TryGetValue(cpr.Id, out var project);
            var resolution = project?.BACResolutions.FirstOrDefault(r => !r.IsDeleted);
            var hasBacRes = resolution != null || project != null;
            var bacStatus = !string.IsNullOrEmpty(resolution?.Status) ? resolution.Status : project?.Status;
            var bacNumber = !string.IsNullOrEmpty(resolution?.ResolutionNumber) ? resolution.ResolutionNumber : null;
            var bacId = resolution?.Id ?? project?.Id;

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
                // With the new schema, a PRItem maps 1:1 to a specific month.
                result.Add(new ConsolidatedPrItemForRFQDto
                {
                    CPRItemId = cprItem.Id,
                    ConsolidatedPRId = cpr.Id,
                    CPRNumber = cpr.CPRNumber,
                    ItemName = prItem.Name,
                    Category = category,
                    Fund = fund,
                    Month = prItem.RequestedMonth,
                    UnitCost = prItem.UnitCost,
                    RequestedQuantity = prItem.RequestedQuantity,
                    AlreadySourcedQuantity = alreadySourced,
                    ProcurementModeId = cprItem.ProcurementModeId ?? Guid.Empty,
                    ProcurementModeName = cprItem.ProcurementMode?.Name,
                    HasBACResolution = hasBacRes,
                    BACResolutionStatus = bacStatus,
                    BACResolutionNumber = bacNumber,
                    BACResolutionId = bacId
                });
            }
        }

        return ApiResponse<List<ConsolidatedPrItemForRFQDto>>.Success(result);
    }
}
