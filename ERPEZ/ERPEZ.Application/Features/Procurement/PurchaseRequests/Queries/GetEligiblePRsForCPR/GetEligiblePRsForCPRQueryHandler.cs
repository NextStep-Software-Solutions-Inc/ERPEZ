using ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Queries.GetEligiblePRsForCPR;

public class GetEligiblePRsForCPRQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetEligiblePRsForCPRQuery, ApiResponse<List<EligiblePRResponse>>>
{
    public async Task<ApiResponse<List<EligiblePRResponse>>> Handle(
        GetEligiblePRsForCPRQuery query, CancellationToken cancellationToken)
    {
        var cpr = await unitOfWork.ConsolidatedPRRepository.GetCPRWithDetailsAsync(
            query.ConsolidatedPRId, cancellationToken)
            ?? throw new NotFoundException(
                $"Consolidated PR with ID {query.ConsolidatedPRId} not found.");

        // PRs already in this CPR — exclude them
        var alreadyAddedPRIds = cpr.ConsolidatedPRItems
            .Select(ci => ci.PurchaseRequestId)
            .ToHashSet();

        var approvedPRs = await unitOfWork.PurchaseRequestRepository
            .GetApprovedPRsWithItemsAsync(cancellationToken);

        var result = approvedPRs
            .Where(pr => !alreadyAddedPRIds.Contains(pr.Id))
            .Select(pr => new EligiblePRResponse(
                PurchaseRequestId: pr.Id,
                PRNumber:          pr.PRNumber,
                OfficeId:          pr.OfficeId,
                OfficeName:        pr.Office.Name,
                PRType:            pr.PRType == PRType.NonCSE ? "Non-CSE" : "Out of Stock",
                TotalAmount:       pr.TotalAmount,
                Items: pr.PRItems
                    .Where(i => !i.IsDeleted)
                    .Select(i => new EligiblePRItemResponse(
                        PRItemId:          i.Id,
                        Name:              i.Name,
                        Description:       i.Description,
                        Category:          i.PPMPItem?.NonCSEItem?.Name
                                        ?? i.PPMPItem?.CSEItem?.Name
                                        ?? string.Empty,
                        Fund:              pr.FundCluster?.Name ?? string.Empty,
                        Unit:              i.PPMPItem?.Unit ?? string.Empty,
                        UnitPrice:         i.UnitCost,
                        TotalQuantity:     i.RequestedQuantity,
                        TotalAmount:       i.Amount,
                        StockNo:           i.StockNo,
                        MonthlyQuantities: i.MonthlyQuantities
                            .ToDictionary(m => m.Month, m => m.Quantity)
                    )).ToList()
            ))
            .ToList();

        return ApiResponse<List<EligiblePRResponse>>.Success(result);
    }
}