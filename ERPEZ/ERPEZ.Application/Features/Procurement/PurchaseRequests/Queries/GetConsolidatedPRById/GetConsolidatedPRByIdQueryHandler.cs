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
                        Category:             pr.ProcurementCategory?.Name,
                        Fund:                 pr.FundSource?.Name,
                        Unit:                 ci.PRItem.PPMPItem?.Unit ?? string.Empty,
                        UnitPrice:            ci.PRItem.UnitCost,
                        TotalQuantity:        ci.PRItem.RequestedQuantity,
                        TotalAmount:          ci.PRItem.Amount,
                        StockNo:              ci.PRItem.StockNo,
                        MonthlyQuantities:    ci.PRItem.MonthlyQuantities
                            .ToDictionary(
                                m => ((int)m.Month + 1).ToString("D2"),
                                m => m.Quantity),
                        ProcurementModeId:    ci.ProcurementModeId,
                        AllowPartial:         ci.AllowPartial
                    )).ToList()
                );
            })
            .ToList();

        var response = new ConsolidatedPRDetailResponse(
            Id:                cpr.Id,
            CPRNumber:         cpr.CPRNumber,
            ConsolidationDate: cpr.ConsolidationDate,
            Description:       cpr.Description,
            Purpose:           cpr.Purpose,
            Status:            cpr.Status,
            TotalAmount:       activeItems.Sum(ci => ci.PRItem.Amount), // computed, not stale cpr.TotalAmount
            Remarks:           cpr.Remarks,
            Prs:               prs
        );

        return ApiResponse<ConsolidatedPRDetailResponse>.Success(response);
    }
}