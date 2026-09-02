using ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Queries.GetConsolidatedPRById;

public class GetConsolidatedPRByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetConsolidatedPRByIdQuery, ApiResponse<ConsolidatedPRDetailResponse>>
{
    public async Task<ApiResponse<ConsolidatedPRDetailResponse>> Handle(
        GetConsolidatedPRByIdQuery query, CancellationToken cancellationToken)
    {
        var cpr = await unitOfWork.ConsolidatedPRRepository.GetCPRWithDetailsAsync(
            query.Id, cancellationToken)
            ?? throw new NotFoundException($"Consolidated PR with ID {query.Id} not found.");

        var activeItems = cpr.ConsolidatedPRItems
            .Where(ci => !ci.IsDeleted)
            .ToList();

        var prs = activeItems
            .GroupBy(ci => ci.PurchaseRequestId)
            .Select(g =>
            {
                var pr = g.First().PurchaseRequest;

                return new ConsolidatedPRLinkedPrResponse(
                    PurchaseRequestId: pr.Id,
                    PRNumber:          pr.PRNumber,
                    OfficeId:          pr.OfficeId,
                    OfficeName:        pr.Office.Name,
                    PRType:            pr.PRType.ToString(),
                    TotalAmount:       g.Sum(ci => ci.PRItem.Amount),
                    Items: g.Select(ci => new ConsolidatedPRItemResponse(
                        PRItemId:             ci.PRItemId,
                        ConsolidatedPRItemId: ci.Id,
                        Name:                 ci.PRItem.Name,
                        Description:          ci.PRItem.Description,
                        Category:             ci.PRItem.PPMPItem?.CSEItem?.ItemCategory?.Name 
                                              ?? ci.PRItem.PPMPItem?.NonCSEItem?.ItemCategory?.Name 
                                              ?? ci.PRItem.PPMPItem?.ProjectType.ToString(),
                        Fund:                 pr.FundSource?.Name,
                        Unit:                 ci.PRItem.PPMPItem?.Unit ?? string.Empty,
                        UnitPrice:            ci.PRItem.UnitCost,
                        TotalQuantity:        ci.PRItem.RequestedQuantity,
                        TotalAmount:          ci.PRItem.Amount,
                        StockNo:              ci.PRItem.StockNo,
                        MonthlyQuantities:    new Dictionary<string, int> { { ((int)ci.PRItem.RequestedMonth).ToString("D2"), ci.PRItem.RequestedQuantity } },
                        ProcurementModeId:    ci.ProcurementModeId 
                                              ?? ci.PRItem.PPMPItem?.APPItems?.Where(ai => !ai.IsDeleted && (ai.APP == null || !ai.APP.IsDeleted))
                                                  .OrderByDescending(ai => ai.APP != null && (ai.APP.Status == ERPEZ.Domain.Enums.StatusEnum.Approved || ai.APP.Status == ERPEZ.Domain.Enums.StatusEnum.Active) ? 2 : 1)
                                                  .ThenByDescending(ai => ai.CreatedAt)
                                                  .FirstOrDefault()?.ProcurementModeId
                                              ?? (ci.PRItem.PPMPItem?.ProcurementModeId != Guid.Empty ? ci.PRItem.PPMPItem?.ProcurementModeId : null),
                        AllowPartial:         ci.AllowPartial,
                        ProcurementModeName:  ci.ProcurementMode?.Name 
                                              ?? ci.PRItem.PPMPItem?.APPItems?.Where(ai => !ai.IsDeleted && (ai.APP == null || !ai.APP.IsDeleted))
                                                  .OrderByDescending(ai => ai.APP != null && (ai.APP.Status == ERPEZ.Domain.Enums.StatusEnum.Approved || ai.APP.Status == ERPEZ.Domain.Enums.StatusEnum.Active) ? 2 : 1)
                                                  .ThenByDescending(ai => ai.CreatedAt)
                                                  .FirstOrDefault()?.ProcurementMode?.Name
                                              ?? ci.PRItem.PPMPItem?.ProcurementMode?.Name
                    )).ToList()
                );
            })
            .ToList();

        var firstMode = activeItems
            .Select(ci => ci.ProcurementMode?.Name 
                       ?? ci.PRItem.PPMPItem?.APPItems?.Where(ai => !ai.IsDeleted && (ai.APP == null || !ai.APP.IsDeleted))
                           .OrderByDescending(ai => ai.APP != null && (ai.APP.Status == ERPEZ.Domain.Enums.StatusEnum.Approved || ai.APP.Status == ERPEZ.Domain.Enums.StatusEnum.Active) ? 2 : 1)
                           .ThenByDescending(ai => ai.CreatedAt)
                           .FirstOrDefault()?.ProcurementMode?.Name
                       ?? ci.PRItem.PPMPItem?.ProcurementMode?.Name)
            .FirstOrDefault(m => !string.IsNullOrEmpty(m));

        var response = new ConsolidatedPRDetailResponse(
            Id:                cpr.Id,
            CPRNumber:         cpr.CPRNumber,
            ConsolidationDate: cpr.ConsolidationDate,
            Description:       cpr.Description,
            Purpose:           cpr.Purpose,
            Status:            cpr.Status,
            TotalAmount:       activeItems.Sum(ci => ci.PRItem.Amount), // computed, not stale cpr.TotalAmount
            Remarks:           cpr.Remarks,
            Prs:               prs,
            ModeOfProcurement: firstMode
        );

        return ApiResponse<ConsolidatedPRDetailResponse>.Success(response);
    }
}