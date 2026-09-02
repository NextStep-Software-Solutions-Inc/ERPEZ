using ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Queries.GetPRById;

public class GetPRByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetPRByIdQuery, ApiResponse<PurchaseRequestDetailResponse>>
{
    public async Task<ApiResponse<PurchaseRequestDetailResponse>> Handle(
        GetPRByIdQuery query, CancellationToken cancellationToken)
    {
        var pr = await unitOfWork.PurchaseRequestRepository.GetPRWithDetailsAsync(
            query.Id, cancellationToken)
            ?? throw new NotFoundException($"Purchase Request with ID {query.Id} not found.");

        var response = new PurchaseRequestDetailResponse
        {
            Id                  = pr.Id,
            PRNumber            = pr.PRNumber,
            Description         = pr.Description,
            Purpose             = pr.Purpose,
            PRType              = pr.PRType.ToString(),
            Status              = pr.Status.ToString(),
            RequestedDate       = pr.RequestedDate,
            TotalAmount         = pr.TotalAmount,
            OfficeId            = pr.OfficeId,
            OfficeName          = pr.Office.Name,
            UACSCode            = pr.UACSCodeCombination?.CombinationCode,   // ← fix: use correct property
            FundSource          = pr.FundSource?.Name,
            ProcurementCategory = pr.ProcurementCategory?.Name,
            Items = pr.PRItems
                .Where(i => !i.IsDeleted)
                .Select(i => new PRItemDetailResponse
                {
                    Id                = i.Id,
                    PPMPItemId        = i.PPMPItemId,
                    APRItemId         = i.APRItemId,
                    Name              = i.Name,
                    Description       = !string.IsNullOrWhiteSpace(i.Description) 
                                        ? i.Description 
                                        : (!string.IsNullOrWhiteSpace(i.PPMPItem?.Description) 
                                            ? i.PPMPItem.Description 
                                            : i.PPMPItem?.NonCSEItem?.Description),
                    StockNo           = i.StockNo,
                    IsNonCSE          = i.IsNonCSE,
                    UnitCost          = i.UnitCost,
                    RequestedQuantity = i.RequestedQuantity,
                    Amount            = i.Amount,
                    RequestedMonth    = i.RequestedMonth,
                    Category          = i.PPMPItem?.NonCSEItem?.ItemCategory?.Name 
                                        ?? i.PPMPItem?.CSEItem?.ItemCategory?.Name 
                                        ?? i.PPMPItem?.ProjectType.ToString() 
                                        ?? string.Empty,
                    Fund              = i.PPMPItem?.PPMPExpenditureItem?.PPMP?.FundSource?.Name
                                        ?? i.PPMPItem?.PPMPExpenditureItem?.PPMPActivity?.PPMP?.FundSource?.Name
                                        ?? pr.FundSource?.Name 
                                        ?? string.Empty,
                    PPMPId            = i.PPMPItem?.PPMPExpenditureItem?.PPMPId 
                                        ?? i.PPMPItem?.PPMPExpenditureItem?.PPMPActivity?.PPMPId,
                    PPMPNumber        = i.PPMPItem?.PPMPExpenditureItem?.PPMP?.PPMPNumber 
                                        ?? i.PPMPItem?.PPMPExpenditureItem?.PPMPActivity?.PPMP?.PPMPNumber,
                    Unit              = i.PPMPItem?.Unit 
                                        ?? i.PPMPItem?.NonCSEItem?.UOM?.Name 
                                        ?? i.PPMPItem?.CSEItem?.UOM?.Name 
                                        ?? "unit",
                    OfficeName        = i.PPMPItem?.PPMPExpenditureItem?.PPMP?.Office?.Name
                                        ?? i.PPMPItem?.PPMPExpenditureItem?.PPMPActivity?.PPMP?.Office?.Name
                                        ?? pr.Office?.Name,
                    ProcurementModeId = i.ConsolidatedPRItems?.OrderByDescending(ci => ci.CreatedAt).FirstOrDefault(ci => !ci.IsDeleted && ci.ProcurementModeId.HasValue)?.ProcurementModeId
                                        ?? i.PPMPItem?.APPItems?.Where(ai => !ai.IsDeleted && (ai.APP == null || !ai.APP.IsDeleted))
                                            .OrderByDescending(ai => ai.APP != null && (ai.APP.Status == StatusEnum.Approved || ai.APP.Status == StatusEnum.Active) ? 2 : 1)
                                            .ThenByDescending(ai => ai.CreatedAt)
                                            .FirstOrDefault()?.ProcurementModeId
                                        ?? (i.PPMPItem?.ProcurementModeId != Guid.Empty ? i.PPMPItem?.ProcurementModeId : null),
                    ProcurementModeName = i.ConsolidatedPRItems?.OrderByDescending(ci => ci.CreatedAt).FirstOrDefault(ci => !ci.IsDeleted && ci.ProcurementMode != null)?.ProcurementMode?.Name
                                          ?? i.PPMPItem?.APPItems?.Where(ai => !ai.IsDeleted && (ai.APP == null || !ai.APP.IsDeleted))
                                              .OrderByDescending(ai => ai.APP != null && (ai.APP.Status == StatusEnum.Approved || ai.APP.Status == StatusEnum.Active) ? 2 : 1)
                                              .ThenByDescending(ai => ai.CreatedAt)
                                              .FirstOrDefault()?.ProcurementMode?.Name
                                          ?? i.PPMPItem?.ProcurementMode?.Name
                }).ToList()
        };

        return ApiResponse<PurchaseRequestDetailResponse>.Success(response);
    }
}