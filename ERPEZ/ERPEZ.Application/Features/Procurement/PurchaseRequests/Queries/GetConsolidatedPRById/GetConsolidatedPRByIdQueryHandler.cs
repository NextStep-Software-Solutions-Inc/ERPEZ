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

        var response = new ConsolidatedPRDetailResponse(
            Id:                cpr.Id,
            CPRNumber:         cpr.CPRNumber,
            ConsolidationDate: cpr.ConsolidationDate,
            Description:       cpr.Description,
            Purpose:           cpr.Purpose,
            Status:            cpr.Status,
            TotalAmount:       cpr.TotalAmount,
            Items: cpr.ConsolidatedPRItems
                .Where(ci => !ci.IsDeleted)
                .Select(ci => new ConsolidatedPRItemResponse(
                    Id:                  ci.Id,
                    PurchaseRequestId:   ci.PurchaseRequestId,
                    PRNumber:            ci.PurchaseRequest.PRNumber,
                    OfficeName:          ci.PurchaseRequest.Office.Name,
                    PRType:              ci.PurchaseRequest.PRType.ToString(),
                    PRItemId:            ci.PRItemId,
                    Name:                ci.PRItem.Name,
                    Description:         ci.PRItem.Description,
                    UnitCost:            ci.PRItem.UnitCost,
                    RequestedQuantity:   ci.PRItem.RequestedQuantity,
                    Amount:              ci.PRItem.Amount,
                    StockNo:             ci.PRItem.StockNo,
                    IsNonCSE:            ci.PRItem.IsNonCSE,
                    MonthlyQuantities:   ci.PRItem.MonthlyQuantities
                        .ToDictionary(m => m.Month, m => m.Quantity),
                    ProcurementModeId:   ci.ProcurementModeId,
                    ProcurementModeName: ci.ProcurementMode?.Name,
                    AllowPartial:        ci.AllowPartial
                )).ToList()
        );

        return ApiResponse<ConsolidatedPRDetailResponse>.Success(response);
    }
}